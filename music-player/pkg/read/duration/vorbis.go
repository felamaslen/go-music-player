package duration

import (
	"log"
	"os"

	ov "github.com/anyhon/engine/audio/ov"
)

func GetSongDurationSecondsVorbis(file *os.File) int {
	fileName := file.Name()
	ovFile, ovErr := ov.Fopen(fileName)
	if ovErr != nil {
		// TODO: log these errors to the DB
		log.Printf("[vorbis] Error opening file (%s): %v\n", fileName, ovErr)
		return 0
	}

	result, timeErr := ov.TimeTotal(ovFile, -1)
	if timeErr != nil {
		log.Printf("[vorbis] Error getting duration (%s): %v\n", fileName, timeErr)
		return 0
	}

	ov.Clear(ovFile)

	return int(result)
}
