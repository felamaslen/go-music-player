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

	"github.com/felamaslen/go-music-player/pkg/config"
)

var pool *pgxpool.Pool

func GetConnection() *pgxpool.Conn {
  if pool == nil {
    var err error
    pool, err = pgxpool.Connect(context.Background(), config.Config.DatabaseUrl)

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

func MigrateDatabase(migrationDirectory string) {
  databaseUrl := fmt.Sprintf("%s?sslmode=disable", config.Config.DatabaseUrl)
  directoryUrl := fmt.Sprintf("file://%s", filepath.Join(migrationDirectory, "migrations"))

  m, err := migrate.New(directoryUrl, databaseUrl)
  if err != nil {
    log.Fatal("Error setting up: ", err)
  }
  m.Up()
}
