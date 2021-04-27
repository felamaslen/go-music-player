package server

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/felamaslen/gmus-backend/pkg/repository"
	"github.com/felamaslen/gmus-backend/pkg/types"
	"github.com/go-redis/redis"
	"github.com/jmoiron/sqlx"
)

type ArtistsResponse struct {
	Artists []string `json:"artists"`
}

func routeFetchArtists(l *logger.Logger, rdb redis.Cmdable, w http.ResponseWriter, r *http.Request) error {
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

func routeFetchAlbums(l *logger.Logger, rdb redis.Cmdable, w http.ResponseWriter, r *http.Request) error {
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
	Artist string                 `json:"artist"`
	Songs  *[]*types.SongExternal `json:"songs"`
}

func routeFetchSongs(l *logger.Logger, rdb redis.Cmdable, w http.ResponseWriter, r *http.Request) error {
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

func routeFetchSongInfo(l *logger.Logger, rdb redis.Cmdable, w http.ResponseWriter, r *http.Request) error {
	id, err := validateSongId(w, r)
	if err != nil {
		return nil
	}

	db := database.GetConnection()

	songs, err := repository.SelectSong(db, []int{id})
	if err != nil {
		return err
	}
	if len(*songs) == 0 {
		http.Error(w, "Song not found", http.StatusNotFound)
		return nil
	}

	song := (*songs)[0]

	response, err := json.Marshal(types.SongExternal{
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

func routeFetchMultiSongInfo(l *logger.Logger, rdb redis.Cmdable, w http.ResponseWriter, r *http.Request) error {
	idsArray := r.URL.Query()["ids"]
	if len(idsArray) == 0 {
		http.Error(w, "Must provide valid list of IDs", http.StatusBadRequest)
		return nil
	}

	var ids []int
	for _, id := range idsArray {
		idInt, err := strconv.Atoi(id)
		if err != nil {
			http.Error(w, "All IDs must be numeric", http.StatusBadRequest)
			return nil
		}
		if idInt < 1 {
			http.Error(w, "All IDs must be positive integers", http.StatusBadRequest)
			return nil
		}
		ids = append(ids, idInt)
	}

	songs, err := repository.SelectSong(database.GetConnection(), ids)
	if err != nil {
		return err
	}

	songsArray := []types.SongExternal{}
	for _, song := range *songs {
		songsArray = append(songsArray, types.SongExternal{
			Id:          song.Id,
			TrackNumber: song.TrackNumber,
			Title:       song.Title,
			Artist:      song.Artist,
			Album:       song.Album,
			Duration:    song.Duration,
		})
	}

	response, err := json.Marshal(songsArray)
	if err != nil {
		return err
	}

	w.Write(response)
	return nil
}

type NullResponse struct {
	Id int `json:"id"`
}

func respondWithSongOrNull(db *sqlx.DB, w http.ResponseWriter, song *types.Song) error {
	if song.Id == 0 {
		response, _ := json.Marshal(NullResponse{})
		w.Write(response)
		return nil
	}

	response, err := json.Marshal(types.SongExternal{
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

func routeFetchNextSong(l *logger.Logger, rdb redis.Cmdable, w http.ResponseWriter, r *http.Request) error {
	id, err := validateSongId(w, r)
	if err != nil {
		return nil
	}

	db := database.GetConnection()
	nextSong, err := repository.GetNextSong(db, id)
	if err != nil {
		return err
	}

	if err := respondWithSongOrNull(db, w, nextSong); err != nil {
		return err
	}
	return nil
}

func routeFetchPrevSong(l *logger.Logger, rdb redis.Cmdable, w http.ResponseWriter, r *http.Request) error {
	id, err := validateSongId(w, r)
	if err != nil {
		return nil
	}

	db := database.GetConnection()
	prevSong, err := repository.GetPrevSong(db, id)
	if err != nil {
		return err
	}

	if err := respondWithSongOrNull(db, w, prevSong); err != nil {
		return err
	}
	return nil
}
