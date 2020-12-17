package server

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/felamaslen/go-music-player/pkg/repository"
	"github.com/go-redis/redis/v7"
)

func streamSong(l *logger.Logger, rdb *redis.Client, w http.ResponseWriter, r *http.Request) error {
	songIdQuery := r.URL.Query().Get("songid")
	songId, err := strconv.Atoi(songIdQuery)
	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte("Must set songid to an int"))
		return nil
	}

	db := database.GetConnection()

	song, err := repository.SelectSong(db, songId)
	if err != nil {
		if err.Error() == "No such ID" {
			w.WriteHeader(404)
			w.Write([]byte("No such song"))
			return nil
		}

		return err
	}

	fullFilePath := fmt.Sprintf("%s/%s", song.BasePath, song.RelativePath)

	l.Debug("Streaming to client: %s\n", fullFilePath)

	file, err := os.Open(fullFilePath)
	if err != nil {
		return err
	}

	defer file.Close()

	w.Header().Set("Cache-Control", "no-cache")

	http.ServeContent(w, r, song.Title, time.Unix(song.ModifiedDate, 0), file)

	return nil
}
