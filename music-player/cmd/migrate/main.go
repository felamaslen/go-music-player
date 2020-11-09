package main

import (
  "os"
  "log"
  "fmt"
  "path/filepath"

  "github.com/felamaslen/go-music-player/pkg/config"

  migrate "github.com/golang-migrate/migrate/v4"
  _ "github.com/golang-migrate/migrate/v4/database/postgres"
  _ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
  databaseUrl := fmt.Sprintf("%s?sslmode=disable", config.Config.DatabaseUrl)
  cwd, err := os.Getwd()
  if err != nil {
    log.Fatal("Error getting working dir: ", err)
  }
  directoryUrl := fmt.Sprintf("file://%s", filepath.Join(cwd, "pkg/db/migrations"))

  m, err := migrate.New(directoryUrl, databaseUrl)
  if err != nil {
    log.Fatal("Error setting up: ", err)
  }
  m.Up()
}
