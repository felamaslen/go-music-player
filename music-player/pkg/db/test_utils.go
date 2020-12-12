package db

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v4/pgxpool"
)

func PrepareDatabaseForTesting() *pgxpool.Conn {
  fmt.Println("Preparing database for testing")

  cwd, err := os.Getwd()
  if err != nil {
    log.Fatal("Error getting working dir: ", err)
    os.Exit(1)
  }

  MigrateDatabase(cwd + "/../..")
  conn := GetConnection()

  conn.Query(
    context.Background(),
    "truncate table songs",
  )

  return conn
}
