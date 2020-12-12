package main

import (
	"log"
	"os"

	"github.com/felamaslen/go-music-player/pkg/db"
)

func main() {
  cwd, err := os.Getwd()
  if err != nil {
    log.Fatal("Error getting directory:", err)
    return
  }
  db.MigrateDatabase(cwd)
}
