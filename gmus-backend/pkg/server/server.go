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

func (s *Server) Init() {
	s.l = logger.CreateLogger(config.GetConfig().LogLevel)
	s.router = mux.NewRouter()

	healthRoutes(s.l, s.router)
}

func (s *Server) Listen() {
	conf := config.GetConfig()

	handler := cors.New(cors.Options{
		AllowedOrigins:   conf.AllowedOrigins,
		AllowCredentials: true,
	}).Handler(s.router)

	s.l.Info("Starting server on %s:%d\n", conf.Host, conf.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:%d", conf.Host, conf.Port), handler))
}

func StartServer() {
	conf := config.GetConfig()
	l := logger.CreateLogger(conf.LogLevel)

	server := Server{}
	server.Init()

	rdb := redis.NewClient(&redis.Options{Addr: conf.RedisUrl})
	defer rdb.Close()

	initPubsub(l, rdb, server.router)

	server.router.Path("/stream").Methods("GET").HandlerFunc(routeHandler(l, rdb, streamSong))

	server.router.Path("/artists").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchArtists))
	server.router.Path("/albums").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchAlbums))
	server.router.Path("/songs").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchSongs))

	server.router.Path("/song-info").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchSongInfo))
	server.router.Path("/multi-song-info").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchMultiSongInfo))

	server.router.Path("/next-song").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchNextSong))
	server.router.Path("/prev-song").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchPrevSong))

	server.router.Path("/shuffle-song").Methods("GET").HandlerFunc(routeHandler(l, rdb, routeFetchShuffledSong))

	server.Listen()
}
