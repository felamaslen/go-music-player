package testing

import (
	"context"
	"fmt"
	"os"
	"path"
	"runtime"

	"github.com/felamaslen/go-music-player/pkg/db"
	"github.com/jackc/pgx/v4/pgxpool"
)

func ChangeToRootDir() {
  _, filename, _, _ := runtime.Caller(0)
  dir := path.Join(path.Dir(filename), "../..")
  fmt.Printf("Changing dir to %v\n", dir)
  err := os.Chdir(dir)
  if err != nil {
    panic(err)
  }
}

func init() {
  ChangeToRootDir()
}

func PrepareDatabaseForTesting() *pgxpool.Conn {
  fmt.Println("Preparing database for testing")

  db.MigrateDatabase()
  conn := db.GetConnection()

  conn.Query(
    context.Background(),
    "truncate table songs",
  )

  return conn
}
