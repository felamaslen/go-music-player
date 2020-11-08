package main

import (
  "fmt"
  "github.com/felamaslen/go-music-player/pkg/db"
)

func main() {
  fmt.Println("Hello world! TODO: start scanning music into database")

  db.InsertMusicIntoDatabase()
}
