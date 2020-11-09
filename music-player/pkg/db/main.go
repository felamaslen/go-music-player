package db

import (
  "os"
  "fmt"
  "context"

  "github.com/jackc/pgx/v4"

  "github.com/felamaslen/go-music-player/pkg/config"
)

func GetConnection() *pgx.Conn {
  conn, err := pgx.Connect(context.Background(), config.Config.DatabaseUrl)
  if err != nil {
    fmt.Fprintf(os.Stderr, "Unable to acquire database connection: %v\n", err)
    os.Exit(1)
  }

  return conn
}
