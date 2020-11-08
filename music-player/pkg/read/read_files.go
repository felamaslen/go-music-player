package read

import (
  "os"
  "fmt"
  "io/ioutil"
  "path/filepath"

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

func ReadMultipleFiles(files chan string) chan *Song {
  songs := make(chan *Song)

  go func() {
    defer close(songs)

    for {
      select {
      case file, more := <- files:
        if more {
          song, err := ReadFile(file)
          if err == nil {
            songs <- song
          } else {
            fmt.Printf("Error reading file (%s): %s\n", file, err)
          }
        } else {
          return
        }
      }
    }
  }()

  return songs
}

func isValidFile(file string) bool {
  // TODO: support FLAC/MP3
  return filepath.Ext(file) == ".ogg"
}

func recursiveDirScan(directory string, output chan string, root bool) {
  files, err := ioutil.ReadDir(directory)
  if err != nil {
    fmt.Printf("Error scanning directory (%s): %s", directory, err)
    return
  }

  for _, file := range(files) {
    relativePath := filepath.Join(directory, file.Name())

    if file.IsDir() {
      recursiveDirScan(relativePath, output, false)
    } else if isValidFile(file.Name()) {
      output <- relativePath
    }
  }

  if (root) {
    close(output)
  }
}

func ScanDirectory(directory string) chan string {
  files := make(chan string)
  
  go func() {
    recursiveDirScan(directory, files, true)
  }()

  return files
}
