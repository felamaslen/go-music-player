package repository

import (
	"github.com/felamaslen/gmus-backend/pkg/types"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

const BATCH_SIZE = 100

func SelectSong(db *sqlx.DB, ids []int) (songs *[]*types.Song, err error) {
	songs = &[]*types.Song{}
	var idsArray pq.Int64Array
	for _, id := range ids {
		idsArray = append(idsArray, int64(id))
	}

	err = db.Select(songs, querySelectSongById, idsArray)

	return
}

func SelectPagedArtists(db *sqlx.DB, limit int, offset int) (artists *[]string, err error) {
	artists = &[]string{}
	err = db.Select(artists, querySelectArtistsOrdered, limit, offset)
	return
}

type CountRow struct {
	Count int `db:"count"`
}

func SelectArtistCount(db *sqlx.DB) (count int, err error) {
	var countRow CountRow

	err = db.QueryRowx(queryCountArtists).StructScan(&countRow)

	count = countRow.Count

	return
}

func SelectAllArtists(db *sqlx.DB) (artists *[]string, err error) {
	artists = &[]string{}
	err = db.Select(artists, `select distinct artist from songs order by artist`)
	return
}

func SelectAlbumsByArtist(db *sqlx.DB, artist string) (albums *[]string, err error) {
	albums = &[]string{}
	err = db.Select(albums, querySelectAlbumsByArtist, artist)

	return
}

func SelectSongsByArtist(db *sqlx.DB, artist string) (songs *[]*types.SongExternal, err error) {
	songs = &[]*types.SongExternal{}
	err = db.Select(songs, querySelectSongsByArtist, artist)

	return
}

func BatchUpsertSongs(db *sqlx.DB, batch *[BATCH_SIZE]*types.Song, batchSize int) error {
	var trackNumbers pq.Int64Array
	var titles pq.StringArray
	var artists pq.StringArray
	var albums pq.StringArray
	var durations pq.Int64Array

	var modifiedDates pq.Int64Array

	var basePaths pq.StringArray
	var relativePaths pq.StringArray

	for i := 0; i < batchSize; i++ {
		trackNumbers = append(trackNumbers, int64((*batch)[i].TrackNumber))
		titles = append(titles, (*batch)[i].Title)
		artists = append(artists, (*batch)[i].Artist)
		albums = append(albums, (*batch)[i].Album)
		durations = append(durations, int64((*batch)[i].Duration))

		modifiedDates = append(modifiedDates, (*batch)[i].ModifiedDate)

		basePaths = append(basePaths, (*batch)[i].BasePath)
		relativePaths = append(relativePaths, (*batch)[i].RelativePath)
	}

	_, err := db.Exec(
		queryInsertSongs,
		trackNumbers,
		titles,
		artists,
		albums,
		durations,
		modifiedDates,
		basePaths,
		relativePaths,
	)

	return err
}
