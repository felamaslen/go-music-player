package server

import (
	"fmt"
	"log"
	"net/http"

	"github.com/felamaslen/go-music-player/pkg/config"
	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/go-redis/redis/v7"
	"github.com/gorilla/mux"
)

func StartServer() {
  conf := config.GetConfig()
  l := logger.CreateLogger(conf.LogLevel)

  rdb := redis.NewClient(&redis.Options{ Addr: conf.RedisUrl })
  defer rdb.Close()

  router := mux.NewRouter()

  initPubsub(l, rdb, router)

  router.Path("/stream").Methods("GET").HandlerFunc(routeHandler(l, rdb, streamSong))

  port := conf.Port

  l.Info("Starting server on port %d\n", port)
  log.Fatal(http.ListenAndServe(fmt.Sprintf("localhost:%d", port), router))
}
