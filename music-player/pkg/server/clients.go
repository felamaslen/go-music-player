package server

import (
	"net/http"

	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/go-redis/redis/v7"
)

func getClientNameFromRequest(r *http.Request) string {
  return r.URL.Query().Get(CLIENT_QUERY_NAME)
}

func endSubscription(sub *redis.PubSub) error {
  if err := sub.Unsubscribe(); err != nil {
    return err
  }
  if err := sub.Close(); err != nil {
    return err
  }
  return nil
}

func (c *Client) exposeToNetwork(l *logger.Logger, rdb *redis.Client) error {
  // Expose the client to all pods running the server
  if _, err := rdb.SAdd(KEY_CLIENT_NAMES, c.name).Result(); err != nil {
    return err
  }

  allClients, err := rdb.SMembers(KEY_CLIENT_NAMES).Result()
  if err != nil {
    return err
  }

  if err := publishAction(rdb, &Action{
    Type: ClientConnected,
    Payload: allClients,
  }); err != nil {
    return err
  }

  return nil
}

func (c *Client) disposeFromNetwork(l *logger.Logger, rdb *redis.Client) error {
  // Make sure other clients know when one goes away
  if _, err := rdb.SRem(KEY_CLIENT_NAMES, c.name).Result(); err != nil {
    return err
  }

  allClients, err := rdb.SMembers(KEY_CLIENT_NAMES).Result()
  if err != nil {
    return err
  }

  if err := publishAction(rdb, &Action{
    Type: ClientDisconnected,
    Payload: allClients,
  }); err != nil {
    return err
  }

  return nil
}

func (c *Client) subscribeToMe(l *logger.Logger, rdb *redis.Client) {
  // Subscribe this pod to messages from the client. This pod is responsible for
  // onward publishing to other pods where necessary, via internal pubsub

  for {
    select {
    case <- c.closeChan:
      return
    default:
      var actionFromClient Action
      if err := c.conn.ReadJSON(&actionFromClient); err != nil {
	return
      }

      l.Debug("[->Client] %s (%s)\n", actionFromClient.Type, c.name)

      actionFromClient.FromClient = &c.name

      if err := publishAction(rdb, &actionFromClient); err != nil {
	l.Error("Error publishing action from client: %v\n", err)
      }
    }
  }
}

func (c *Client) onConnect(l *logger.Logger, rdb *redis.Client) error {
  if err := c.exposeToNetwork(l, rdb); err != nil {
    l.Error("Error exposing new client to network: %v\n", err)
    return err
  }

  c.subscribeToMe(l, rdb)

  return nil
}

func (c *Client) onDisconnect(l *logger.Logger, rdb *redis.Client) error {
  l.Verbose("[Client disconnected] %s\n", c.name)
  close(c.closeChan)

  if err := c.disposeFromNetwork(l, rdb); err != nil {
    l.Error("Error disposing client from network: %v\n", err)
    return err
  }

  return nil
}
