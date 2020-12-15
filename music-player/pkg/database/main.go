package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	migrate "github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	config "github.com/felamaslen/go-music-player/pkg/config"

	_ "github.com/jackc/pgx/stdlib"
	"github.com/jmoiron/sqlx"
)

var db *sqlx.DB

func GetConnection() *sqlx.DB {
  if (db != nil) {
    return db
  }

  db = sqlx.MustConnect("pgx", config.GetConfig().DatabaseUrl)

  return db
}

func EndPool() {
  if (db == nil) {
    return
  }

  db.Close()
}

func MigrateDatabase() {
  cwd, err := os.Getwd()
  if err != nil {
    log.Fatal("Error getting directory:", err)
    return
  }
  directoryUrl := fmt.Sprintf("file://%s", filepath.Join(cwd, "migrations"))

  m, err := migrate.New(directoryUrl, config.GetConfig().DatabaseUrl)
  if err != nil {
    log.Fatal("Error setting up: ", err)
  }
  m.Up()
}
