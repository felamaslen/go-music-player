package server

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/felamaslen/go-music-player/pkg/read"
	"github.com/felamaslen/go-music-player/pkg/repository"
	"github.com/felamaslen/go-music-player/pkg/services"
	"github.com/go-redis/redis/v7"
)

type ArtistsResponse struct {
  Artists []string 	`json:"artists"`
  More bool 		`json:"more"`
}

func routeFetchArtists(l *logger.Logger, rdb *redis.Client, w http.ResponseWriter, r *http.Request) error {
  limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
  if err != nil {
    http.Error(w, "Limit must be an integer", http.StatusBadRequest)
    return nil
  }
  if limit < 1 || limit > 1000 {
    http.Error(w, "Limit must be between 1 and 1000", http.StatusBadRequest)
    return nil
  }

  page, err := strconv.Atoi(r.URL.Query().Get("page"))
  if err != nil {
    http.Error(w, "Page must be an integer", http.StatusBadRequest)
    return nil
  }
  if page < 0 {
    http.Error(w, "Page must be non-negative", http.StatusBadRequest)
    return nil
  }

  artists, more := services.GetArtists(limit, page)

  response, err := json.Marshal(ArtistsResponse{
    Artists: *artists,
    More: more,
  })
  if err != nil {
    return err
  }

  w.Write(response)
  return nil
}

type AlbumsResponse struct {
  Artist string 	`json:"artist"`
  Albums []string 	`json:"albums"`
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
  Artist string 		`json:"artist"`
  Songs *[]*read.SongExternal 	`json:"songs"`
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
    Songs: songs,
  })
  if err != nil {
    return err
  }

  w.Write(response)
  return nil
}

func routeFetchSongInfo(l *logger.Logger, rdb *redis.Client, w http.ResponseWriter, r *http.Request) error {
  idRaw := r.URL.Query().Get("id")
  idInt, err := strconv.Atoi(idRaw)
  if err != nil {
    http.Error(w, "Must provide a valid id", http.StatusBadRequest)
    return nil
  }
  if idInt < 1 {
    http.Error(w, "id must be non-negative", http.StatusBadRequest)
    return nil
  }

  db := database.GetConnection()

  song, err := repository.SelectSong(db, idInt)
  if err != nil {
    if err.Error() == "No such ID" {
      http.Error(w, "Song not found", http.StatusNotFound)
      return nil
    }
    return err
  }

  response, err := json.Marshal(read.SongExternal{
    Id: idInt,
    TrackNumber: song.TrackNumber,
    Title: song.Title,
    Artist: song.Artist,
    Album: song.Album,
    Duration: song.Duration,
  })
  if err != nil {
    return err
  }

  w.Write(response)
  return nil
}
