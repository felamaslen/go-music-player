package read

import (
  "fmt"
  "io/ioutil"
  "path/filepath"
)

func ReadMultipleFiles(basePath string, files chan string) chan *Song {
  songs := make(chan *Song)

  go func() {
    defer close(songs)

    for {
      select {
      case file, more := <- files:
        if more {
          song, err := ReadFile(basePath, file)
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

func recursiveDirScan(directory string, output chan string, root bool, basePath string) {
  files, err := ioutil.ReadDir(directory)
  if err != nil {
    fmt.Printf("Error scanning directory (%s): %s", directory, err)
    return
  }

  for _, file := range(files) {
    absolutePath := filepath.Join(directory, file.Name())
    relativePath := filepath.Join(basePath, file.Name())

    if file.IsDir() {
      recursiveDirScan(absolutePath, output, false, relativePath)
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
    recursiveDirScan(directory, files, true, "")
  }()

  return files
}
