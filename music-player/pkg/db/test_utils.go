package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v4/pgxpool"
)

func PrepareDatabaseForTesting() *pgxpool.Conn {
  fmt.Println("Preparing database for testing")

  MigrateDatabase()
  conn := GetConnection()

  conn.Query(
    context.Background(),
    "truncate table songs",
  )

  return conn
}
