package duration

import (
  "os"
  "fmt"

  tag "github.com/dhowden/tag"
)

func GetSongDuration(file *os.File, tags tag.Metadata) (duration int, ok bool) {
  switch tags.Format() {
  case "VORBIS":
    return GetSongDurationVorbis(file.Name())
  default:
    fmt.Printf("Unrecognised format: %s\n", tags.Format())
    return 0, false
  }
}
