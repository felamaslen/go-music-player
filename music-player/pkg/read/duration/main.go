package duration

import (
  "os"
  "fmt"

  tag "github.com/dhowden/tag"
)

func GetSongDuration(file *os.File, tags tag.Metadata) int {
  switch tags.Format() {
  case "VORBIS":
    result, _ := GetSongDurationVorbis(file.Name())
    return result
  default:
    fmt.Printf("Unrecognised format: %s\n", tags.Format())
    return 0
  }
}
