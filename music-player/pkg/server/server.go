package server

import (
	"fmt"
	"log"
	"net/http"

	"github.com/felamaslen/go-music-player/pkg/config"
	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/go-redis/redis/v7"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func StartServer() {
	conf := config.GetConfig()
	l := logger.CreateLogger(conf.LogLevel)

	rdb := redis.NewClient(&redis.Options{Addr: conf.RedisUrl})
	defer rdb.Close()

	router := mux.NewRouter()

	initPubsub(l, rdb, router)

	router.Path("/stream").Methods("GET").HandlerFunc(routeHandler(l, rdb, streamSong))

	router.Path("/artists").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchArtists))
	router.Path("/albums").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchAlbums))
	router.Path("/songs").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchSongs))

	router.Path("/song-info").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchSongInfo))

	port := conf.Port

	handler := cors.AllowAll().Handler(router)

	l.Info("Starting server on port %d\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("localhost:%d", port), handler))
}
