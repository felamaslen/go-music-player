package server

import (
	"encoding/json"
	"net/http"

	"github.com/felamaslen/gmus-backend/pkg/config"
	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

func healthRoutes(l *logger.Logger, router *mux.Router) {
	resOk, _ := json.Marshal(map[string]bool{"ok": true})
	resNotOk, _ := json.Marshal(map[string]bool{"ok": false})

	router.Path("/liveness").Methods("GET").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write(resOk)
	})

	var isReady = false

	router.Path("/readiness").Methods("GET").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !isReady {
			db, err := sqlx.Connect("pgx", config.GetConfig().DatabaseUrl)
			if err == nil {
				_, err = db.Query("select version()")
			}
			if err == nil {
				isReady = true
			} else {
				l.Error("[readiness] Error getting connection: %v\n", err)
				http.Error(w, "Could not get database connection", http.StatusInternalServerError)
				w.Write(resNotOk)
				return
			}
		}
		w.Write(resOk)
	})
}
