package repository

import (
	"database/sql"

	"github.com/felamaslen/gmus-backend/pkg/types"
	"github.com/jmoiron/sqlx"
)

func GetNextSong(db *sqlx.DB, prevSongId int) (nextSong *types.Song, err error) {
	nextSong = &types.Song{}
	err = db.QueryRowx(
		querySelectNextSong,
		prevSongId,
	).StructScan(nextSong)
	if err != nil && err == sql.ErrNoRows {
		err = nil
		nextSong = &types.Song{Id: 0}
	}
	return
}

func GetPrevSong(db *sqlx.DB, nextSongId int) (prevSong *types.Song, err error) {
	prevSong = &types.Song{}
	err = db.QueryRowx(
		querySelectPrevSong,
		nextSongId,
	).StructScan(prevSong)
	if err != nil && err == sql.ErrNoRows {
		err = nil
		prevSong = &types.Song{Id: 0}
	}
	return
}

func GetShuffledSong(db *sqlx.DB, currentSongId *int) (shuffledSong *types.Song, err error) {
	shuffledSong = &types.Song{}

	if currentSongId == nil {
		err = db.QueryRowx(querySelectFirstShuffledSong).StructScan(shuffledSong)
	} else {
		err = db.QueryRowx(querySelectNextShuffledSong, *currentSongId).StructScan(shuffledSong)
	}

	if err != nil && err == sql.ErrNoRows {
		err = nil
		shuffledSong = &types.Song{Id: 0}
	}

	return
}
