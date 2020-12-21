package read

import (
	"os"
	"path/filepath"

	tag "github.com/dhowden/tag"
	duration "github.com/felamaslen/gmus-backend/pkg/read/duration"
)

func ReadFile(basePath string, scannedFile *File) (song *Song, err error) {
	fullPath := filepath.Join(basePath, scannedFile.RelativePath)
	file, errFile := os.Open(fullPath)
	if errFile != nil {
		return &Song{}, errFile
	}

	defer file.Close()

	tags, errTags := tag.ReadFrom(file)
	if errTags != nil {
		return &Song{}, errTags
	}

	durationSeconds := duration.GetSongDurationSeconds(file, tags)

	trackNumber, _ := tags.Track()

	result := Song{
		TrackNumber:  trackNumber,
		Title:        tags.Title(),
		Artist:       tags.Artist(),
		Album:        tags.Album(),
		Duration:     durationSeconds,
		BasePath:     basePath,
		RelativePath: scannedFile.RelativePath,
		ModifiedDate: scannedFile.ModifiedDate,
	}

	return &result, nil
}