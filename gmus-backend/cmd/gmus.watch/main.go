package main

import (
	"github.com/felamaslen/gmus-backend/pkg/config"
	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/felamaslen/gmus-backend/pkg/read"
	"github.com/felamaslen/gmus-backend/pkg/server"
)

func main() {
	conf := config.GetConfig()
	l := logger.CreateLogger(conf.LogLevel)

	l.Info("Watching library for changes")
	go read.WatchLibraryRecursive(l, conf.LibraryDirectory)

	// This is necessary for the liveness and readiness probes
	srv := server.Server{}
	srv.Init()
	srv.Listen()
}
