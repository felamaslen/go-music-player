package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/go-redis/redis/v7"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleClientSubscription(thisPodClients *map[string]*Client) RouteHandler {
	return func(l *logger.Logger, rdb *redis.Client, w http.ResponseWriter, r *http.Request) error {
		clientName := getClientNameFromRequest(r)
		if len(clientName) == 0 {
			w.WriteHeader(400)
			w.Write([]byte("Must set client name in query"))
			return nil
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			w.WriteHeader(400)
			w.Write([]byte("Incorrect client config to upgrade WS"))
			return nil
		}

		client := Client{
			name:      clientName,
			conn:      conn,
			closeChan: make(chan bool),
		}

		(*thisPodClients)[client.name] = &client

		defer conn.Close()

		go func() {
			for {
				select {
				case <-client.closeChan:
					l.Verbose("Caught closeChan call, closing... %s\n", client.name)
					if _, ok := (*thisPodClients)[client.name]; ok {
						delete(*thisPodClients, client.name)
					}
					client.onDisconnect(l, rdb)
					return
				}
			}
		}()

		if err := client.onConnect(l, rdb); err != nil {
			l.Error("Error connecting client: %v\n", err)
			return err
		}

		return nil
	}
}

func subscribeToBroadcast(
	l *logger.Logger,
	rdb *redis.Client,
	thisPodClients *map[string]*Client,
) {
	// Subscribe all of this pod's clients to messages from any pod, via internal pubsub
	subscription := rdb.Subscribe(TOPIC_BROADCAST)

	for {
		select {
		case msg, ok := <-subscription.Channel():
			if !ok {
				return
			}

			var actionFromPubsub Action

			if err := json.Unmarshal([]byte(msg.Payload), &actionFromPubsub); err != nil {
				l.Error("Invalid action from pubsub: %v\n", err)

			} else {
				if actionFromPubsub.FromClient == nil {
					l.Debug("[<-Server] %s\n", actionFromPubsub.Type)
				} else {
					l.Debug("[<-Client] %s (%s)\n", actionFromPubsub.Type, *actionFromPubsub.FromClient)
				}

				errors := broadcastAction(thisPodClients, &actionFromPubsub)

				if len(errors) > 0 {
					l.Warn("Error broadcasting: %v\n", errors)
				}
			}
		}
	}
}

func pruneDisappearedClients(l *logger.Logger, rdb *redis.Client) {
	for {
		now := time.Now().Unix()
		rdb.ZRemRangeByScore(KEY_CLIENT_NAMES, "0", fmt.Sprintf("%d", now-CLIENT_TTL_SEC))

		time.Sleep(CLIENT_TTL_SEC * time.Second)
	}
}

func initPubsub(l *logger.Logger, rdb *redis.Client, router *mux.Router) {
	thisPodClients := make(map[string]*Client)
	go subscribeToBroadcast(l, rdb, &thisPodClients)
	go pruneDisappearedClients(l, rdb)

	router.Path("/pubsub").Methods("GET").HandlerFunc(
		routeHandler(l, rdb, handleClientSubscription(&thisPodClients)),
	)
}
