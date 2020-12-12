package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/jackc/pgx/v4/pgxpool"

	migrate "github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	config "github.com/felamaslen/go-music-player/pkg/config"
)

var pool *pgxpool.Pool

func GetConnection() *pgxpool.Conn {
  if pool == nil {
    var err error
    pool, err = pgxpool.Connect(context.Background(), config.GetConfig().DatabaseUrl)

    if err != nil {
      fmt.Fprintf(os.Stderr, "Unable to acquire database connection pool: %v\n", err)
      os.Exit(1)
    }
  }

  conn, err := pool.Acquire(context.Background())
  if err != nil {
    fmt.Fprintf(os.Stderr, "Unable to acquire connection from pool: %v\n", err)
    os.Exit(1)
  }

  return conn
}

func EndPool() {
  if pool == nil {
    return
  }
  pool.Close()
}

func MigrateDatabase() {
  cwd, err := os.Getwd()
  if err != nil {
    log.Fatal("Error getting directory:", err)
    return
  }
  databaseUrl := fmt.Sprintf("%s?sslmode=disable", config.GetConfig().DatabaseUrl)
  directoryUrl := fmt.Sprintf("file://%s", filepath.Join(cwd, "migrations"))

  m, err := migrate.New(directoryUrl, databaseUrl)
  if err != nil {
    log.Fatal("Error setting up: ", err)
  }
  m.Up()
}
