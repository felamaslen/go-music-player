package read

import (
	"os"
	"path/filepath"

	tag "github.com/dhowden/tag"
	duration "github.com/felamaslen/gmus-backend/pkg/read/duration"
	"github.com/felamaslen/gmus-backend/pkg/types"
)

func ReadFile(basePath string, scannedFile *types.File) (song *types.Song, err error) {
	fullPath := filepath.Join(basePath, scannedFile.RelativePath)
	file, errFile := os.Open(fullPath)
	if errFile != nil {
		return &types.Song{}, errFile
	}

	defer file.Close()

	tags, errTags := tag.ReadFrom(file)
	if errTags != nil {
		return &types.Song{}, errTags
	}

	durationSeconds := duration.GetSongDurationSeconds(file, tags)

	trackNumber, _ := tags.Track()

	result := types.Song{
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
