package testing

import (
	"os"
	"path"
	"runtime"

	"github.com/felamaslen/gmus-backend/pkg/database"
)

func ChangeToRootDir() {
	_, filename, _, _ := runtime.Caller(0)
	dir := path.Join(path.Dir(filename), "../..")
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
