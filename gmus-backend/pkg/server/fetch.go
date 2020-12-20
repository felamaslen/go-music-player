package server

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/felamaslen/gmus-backend/pkg/read"
	"github.com/felamaslen/gmus-backend/pkg/repository"
	"github.com/go-redis/redis/v7"
	"github.com/jmoiron/sqlx"
)

type ArtistsResponse struct {
	Artists []string `json:"artists"`
}

func routeFetchArtists(l *logger.Logger, rdb *redis.Client, w http.ResponseWriter, r *http.Request) error {
	db := database.GetConnection()
	artists, err := repository.SelectAllArtists(db)
	if err != nil {
		return err
	}

	response, err := json.Marshal(ArtistsResponse{
		Artists: *artists,
	})
	if err != nil {
		return err
	}

	w.Write(response)
	return nil
}

type AlbumsResponse struct {
	Artist string   `json:"artist"`
	Albums []string `json:"albums"`
}

func routeFetchAlbums(l *logger.Logger, rdb *redis.Client, w http.ResponseWriter, r *http.Request) error {
	artist := r.URL.Query().Get("artist")

	db := database.GetConnection()

	albums, err := repository.SelectAlbumsByArtist(db, artist)
	if err != nil {
		return err
	}

	response, err := json.Marshal(AlbumsResponse{
		Artist: artist,
		Albums: *albums,
	})
	if err != nil {
		return err
	}

	w.Write(response)
	return nil
}

type SongsResponse struct {
	Artist string                `json:"artist"`
	Songs  *[]*read.SongExternal `json:"songs"`
}

func routeFetchSongs(l *logger.Logger, rdb *redis.Client, w http.ResponseWriter, r *http.Request) error {
	artist := r.URL.Query().Get("artist")

	db := database.GetConnection()

	songs, err := repository.SelectSongsByArtist(db, artist)
	if err != nil {
		return err
	}

	response, err := json.Marshal(SongsResponse{
		Artist: artist,
		Songs:  songs,
	})
	if err != nil {
		return err
	}

	w.Write(response)
	return nil
}

func validateSongId(w http.ResponseWriter, r *http.Request) (id int, err error) {
	idRaw := r.URL.Query().Get("id")
	id, err = strconv.Atoi(idRaw)
	if err != nil {
		http.Error(w, "Must provide a valid id", http.StatusBadRequest)
	} else if id < 1 {
		http.Error(w, "id must be non-negative", http.StatusBadRequest)
	}
	return
}

func routeFetchSongInfo(l *logger.Logger, rdb *redis.Client, w http.ResponseWriter, r *http.Request) error {
	id, err := validateSongId(w, r)
	if err != nil {
		return nil
	}

	db := database.GetConnection()

	song, err := repository.SelectSong(db, id)
	if err != nil {
		if err.Error() == "No such ID" {
			http.Error(w, "Song not found", http.StatusNotFound)
			return nil
		}
		return err
	}

	response, err := json.Marshal(read.SongExternal{
		Id:          id,
		TrackNumber: song.TrackNumber,
		Title:       song.Title,
		Artist:      song.Artist,
		Album:       song.Album,
		Duration:    song.Duration,
	})
	if err != nil {
		return err
	}

	w.Write(response)
	return nil
}

type NullResponse struct {
	Id int `json:"id"`
}

func respondWithSongOrNull(db *sqlx.DB, w http.ResponseWriter, song *read.Song) error {
	if song.Id == 0 {
		response, _ := json.Marshal(NullResponse{})
		w.Write(response)
		return nil
	}

	response, err := json.Marshal(read.SongExternal{
		Id:          song.Id,
		TrackNumber: song.TrackNumber,
		Title:       song.Title,
		Artist:      song.Artist,
		Album:       song.Album,
		Duration:    song.Duration,
	})

	if err != nil {
		return err
	}

	w.Write(response)
	return nil
}

func routeFetchNextSong(l *logger.Logger, rdb *redis.Client, w http.ResponseWriter, r *http.Request) error {
	id, err := validateSongId(w, r)
	if err != nil {
		return nil
	}

	db := database.GetConnection()
	nextSong, err := repository.GetNextSong(db, int64(id))
	if err != nil {
		return err
	}

	if err := respondWithSongOrNull(db, w, nextSong); err != nil {
		return err
	}
	return nil
}

func routeFetchPrevSong(l *logger.Logger, rdb *redis.Client, w http.ResponseWriter, r *http.Request) error {
	id, err := validateSongId(w, r)
	if err != nil {
		return nil
	}

	db := database.GetConnection()
	prevSong, err := repository.GetPrevSong(db, int64(id))
	if err != nil {
		return err
	}

	if err := respondWithSongOrNull(db, w, prevSong); err != nil {
		return err
	}
	return nil
}
