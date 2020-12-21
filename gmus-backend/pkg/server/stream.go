package server

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/felamaslen/gmus-backend/pkg/repository"
	"github.com/go-redis/redis"
)

func streamSong(l *logger.Logger, rdb redis.Cmdable, w http.ResponseWriter, r *http.Request) error {
	songIdQuery := r.URL.Query().Get("songid")
	songId, err := strconv.Atoi(songIdQuery)
	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte("Must set songid to an int"))
		return nil
	}

	db := database.GetConnection()

	songs, err := repository.SelectSong(db, []int{songId})
	if err != nil {
		return err
	}
	if len(*songs) == 0 {
		w.WriteHeader(404)
		w.Write([]byte("No such song"))
		return nil
	}

	song := (*songs)[0]

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
