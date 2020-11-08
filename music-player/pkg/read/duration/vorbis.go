package duration

import (
  "fmt"
  ov "github.com/anyhon/engine/audio/ov"
)

func GetSongDurationVorbis(fileName string) (duration int, ok bool) {
  ovFile, ovErr := ov.Fopen(fileName)
  if ovErr != nil {
    fmt.Printf("Error opening file for ogg vorbis duration: %s\n", ovErr)
    return 0, false
  }

  result, errTimeTotal := ov.TimeTotal(ovFile, -1)
  if errTimeTotal != nil {
    fmt.Printf("Error calling TimeTotal for ogg vorbis file: %s\n", errTimeTotal)
    return 0, false
  }

  return int(result), true
}
