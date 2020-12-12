package testing

import (
	"fmt"
	"os"
	"path"
	"runtime"

	"github.com/felamaslen/go-music-player/pkg/database"
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

func PrepareDatabaseForTesting() {
  database.MigrateDatabase()

  db := database.GetConnection()

  db.MustExec("truncate table songs")
}
