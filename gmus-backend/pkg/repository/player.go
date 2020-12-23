package repository

import (
	"database/sql"

	"github.com/felamaslen/gmus-backend/pkg/read"
	"github.com/jmoiron/sqlx"
)

func GetNextSong(db *sqlx.DB, prevSongId int) (nextSong *read.Song, err error) {
	nextSong = &read.Song{}
	err = db.QueryRowx(
		querySelectNextSong,
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
		querySelectPrevSong,
		nextSongId,
	).StructScan(prevSong)
	if err != nil && err == sql.ErrNoRows {
		err = nil
		prevSong = &read.Song{Id: 0}
	}
	return
}
