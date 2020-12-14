package repository

import (
	"errors"

	"github.com/felamaslen/go-music-player/pkg/read"
	"github.com/jmoiron/sqlx"
)

func SelectSong(db *sqlx.DB, id int) (song *read.Song, err error) {
  var songs []*read.Song

  err = db.Select(&songs, `
  select
    track_number
    ,title
    ,artist
    ,album
    ,duration
    ,modified_date
    ,base_path
    ,relative_path
  from songs
  where id = $1
  `, int64(id))

  if len(songs) == 0 {
    err = errors.New("No such ID")
  } else {
    song = songs[0]
  }

  return
}
