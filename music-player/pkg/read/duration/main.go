package duration

import (
  "fmt"
  "os"

  tag "github.com/dhowden/tag"
)

func GetSongDurationSeconds(file *os.File, tags tag.Metadata) int {
  switch tags.Format() {
  case "VORBIS":
    return GetSongDurationSecondsVorbis(file)
  default:
    fmt.Printf("Unrecognised format: %s\n", tags.Format())
    return 0
  }
}
