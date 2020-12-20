package repository

import (
	"database/sql"

	"github.com/felamaslen/gmus-backend/pkg/read"
	"github.com/jmoiron/sqlx"
)

func GetNextSong(db *sqlx.DB, prevSongId int) (nextSong *read.Song, err error) {
	nextSong = &read.Song{}
	err = db.QueryRowx(
		`
select
  s1.id
  ,s1.track_number
  ,s1.title
  ,s1.artist
  ,s1.album
  ,s1.duration

from (
  select * from songs where id = $1
) s0

left join songs s1 on (
  s1.artist > s0.artist
  or (s1.artist = s0.artist
    and s1.album > s0.album
  )
  or (s1.artist = s0.artist
    and s1.album = s0.album
    and s1.track_number > s0.track_number
  )
  or (s1.artist = s0.artist
    and s1.album = s0.album
    and s1.track_number = s0.track_number
    and s1.title > s0.title
  )
  or (s1.artist = s0.artist
    and s1.album = s0.album
    and s1.track_number = s0.track_number
    and s1.title = s0.title
    and s1.id > s0.id
  )
)

order by
  s1.artist
  ,s1.album
  ,s1.track_number
  ,s1.title
  ,s1.id

limit 1
    `,
		prevSongId,
	).StructScan(nextSong)
	if err != nil && err == sql.ErrNoRows {
		err = nil
		nextSong = &read.Song{Id: 0}
	}
	return
}

func GetPrevSong(db *sqlx.DB, nextSongId int) (prevSong *read.Song, err error) {
	prevSong = &read.Song{}
	err = db.QueryRowx(
		`
select
  s1.id
  ,s1.track_number
  ,s1.title
  ,s1.artist
  ,s1.album
  ,s1.duration

from (
  select * from songs where id = $1
) s0

left join songs s1 on (
  s1.artist < s0.artist
  or (s1.artist = s0.artist
    and s1.album < s0.album
  )
  or (s1.artist = s0.artist
    and s1.album = s0.album
    and s1.track_number < s0.track_number
  )
  or (s1.artist = s0.artist
    and s1.album = s0.album
    and s1.track_number = s0.track_number
    and s1.title < s0.title
  )
  or (s1.artist = s0.artist
    and s1.album = s0.album
    and s1.track_number = s0.track_number
    and s1.title = s0.title
    and s1.id < s0.id
  )
)

order by
  s1.artist desc
  ,s1.album desc
  ,s1.track_number desc
  ,s1.title desc
  ,s1.id desc

limit 1
    `,
		nextSongId,
	).StructScan(prevSong)
	if err != nil && err == sql.ErrNoRows {
		err = nil
		prevSong = &read.Song{Id: 0}
	}
	return
}
