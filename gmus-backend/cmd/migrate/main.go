package main

import (
	"github.com/felamaslen/gmus-backend/pkg/database"
)

func main() {
	database.MigrateDatabase()
}
