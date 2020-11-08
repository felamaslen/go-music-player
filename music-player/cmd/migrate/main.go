package main

import (
  "os"
  "log"
  "fmt"
  "strconv"
  "path/filepath"

  "github.com/felamaslen/go-music-player/pkg/config"

  migrate "github.com/golang-migrate/migrate/v4"
  _ "github.com/golang-migrate/migrate/v4/database/postgres"
  _ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
  config.LoadEnv()

  host, hasHost := os.LookupEnv("POSTGRES_HOST")
  if !hasHost {
    log.Fatal("Must set POSTGRES_HOST")
  }

  user := os.Getenv("POSTGRES_USER")
  password := os.Getenv("POSTGRES_PASSWORD")
  port, hasPort := os.LookupEnv("POSTGRES_PORT")
  if !hasPort {
    port = "5432"
  }
  portNumeric, err := strconv.Atoi(port)
  if err != nil {
    log.Fatal("POSTGRES_PORT must be numeric")
  }

  database, hasDatabase := os.LookupEnv("POSTGRES_DATABASE")
  if !hasDatabase {
    log.Fatal("Must set POSTGRES_DATABASE")
  }

  databaseUrl := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable", user, password, host, portNumeric, database)

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
