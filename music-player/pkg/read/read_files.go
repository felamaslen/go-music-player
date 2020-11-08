package read

import (
  "os"
  "fmt"

  tag "github.com/dhowden/tag"

  duration "github.com/felamaslen/go-music-player/pkg/read/duration"
)

type Song struct {
  title, artist, album string
  length int
}

func ReadFile(fileName string) (song *Song, err error) {
  file, errFile := os.Open(fileName)
  if errFile != nil {
    return &Song{}, errFile
  }
  defer file.Close()

  tags, errTags := tag.ReadFrom(file)
  if errTags != nil {
    return &Song{}, errTags
  }

  result := Song{
    title: tags.Title(),
    artist: tags.Artist(),
    album: tags.Album(),
    length: duration.GetSongDuration(file, tags),
  }

  return &result, nil
}

func ReadMultipleFiles(files chan string, doneChan chan bool) (chan *Song, chan bool) {
  songs := make(chan *Song)
  processed := make(chan bool)

  done := false

  go func() {
    for !done {
      select {
      case file := <- files:
        song, err := ReadFile(file)
        if err == nil {
          songs <- song
        } else {
          fmt.Printf("Error reading file (%s): %s", file, err)
        }
      case <- doneChan:
        done = true
      }
    }

    processed <- true
  }()

  return songs, processed
}
