package server

import (
	"fmt"
	"log"
	"net/http"

	"github.com/felamaslen/gmus-backend/pkg/config"
	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/go-redis/redis"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func StartServer() {
	conf := config.GetConfig()
	l := logger.CreateLogger(conf.LogLevel)

	rdb := redis.NewClient(&redis.Options{Addr: conf.RedisUrl})
	defer rdb.Close()

	router := mux.NewRouter()

	healthRoutes(l, router)

	initPubsub(l, rdb, router)

	router.Path("/stream").Methods("GET").HandlerFunc(routeHandler(l, rdb, streamSong))

	router.Path("/artists").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchArtists))
	router.Path("/albums").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchAlbums))
	router.Path("/songs").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchSongs))

	router.Path("/song-info").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchSongInfo))
	router.Path("/multi-song-info").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchMultiSongInfo))

	router.Path("/next-song").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchNextSong))
	router.Path("/prev-song").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchPrevSong))

	port := conf.Port

	handler := cors.New(cors.Options{
		AllowedOrigins:   conf.AllowedOrigins,
		AllowCredentials: true,
	}).Handler(router)

	l.Info("Starting server on %s:%d\n", conf.Host, port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:%d", conf.Host, port), handler))
}
