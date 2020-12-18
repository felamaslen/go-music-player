package server

import (
	"net/http"

	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/go-redis/redis/v7"
)

type RouteHandler func(l *logger.Logger, rdb *redis.Client, w http.ResponseWriter, r *http.Request) error

func routeHandler(
	l *logger.Logger,
	rdb *redis.Client,
	handler RouteHandler,
) func(w http.ResponseWriter, r *http.Request) {

	return func(w http.ResponseWriter, r *http.Request) {
		err := handler(l, rdb, w, r)

		if err != nil {
			l.Error("Unhandled error during request: %v\n", err)

			http.Error(w, "Unhandled error", http.StatusInternalServerError)
		}
	}
}
