package repository

import (
	"github.com/felamaslen/gmus-backend/pkg/read"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

const BATCH_SIZE = 100

func SelectSong(db *sqlx.DB, ids []int) (songs *[]*read.Song, err error) {
	songs = &[]*read.Song{}
	var idsArray pq.Int64Array
	for _, id := range ids {
		idsArray = append(idsArray, int64(id))
	}

	err = db.Select(songs, `
  select
    id
    ,track_number
    ,title
    ,artist
    ,album
    ,duration
    ,modified_date
    ,base_path
    ,relative_path
  from songs
  where id = ANY($1)
  `, idsArray)

	return
}

func SelectPagedArtists(db *sqlx.DB, limit int, offset int) (artists *[]string, err error) {
	artists = &[]string{}
	err = db.Select(artists, `
  select distinct artist
  from songs
  order by artist
  limit $1
  offset $2
  `, limit, offset)
	return
}

type CountRow struct {
	Count int `db:"count"`
}

func SelectArtistCount(db *sqlx.DB) (count int, err error) {
	var countRow CountRow

	err = db.QueryRowx(`
  select count(*) as count from (
    select distinct artist from songs
  ) distinct_artists
  `).StructScan(&countRow)

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
	err = db.Select(albums, `
  select distinct album
  from songs
  where artist = $1
  order by album
  `, artist)

	return
}

func SelectSongsByArtist(db *sqlx.DB, artist string) (songs *[]*read.SongExternal, err error) {
	songs = &[]*read.SongExternal{}
	err = db.Select(songs, `
  select
    id
    ,track_number
    ,title
    ,artist
    ,album
    ,duration
  from songs
  where artist = $1
  order by album, track_number, title, id
  `, artist)

	return
}

func BatchUpsertSongs(db *sqlx.DB, batch *[BATCH_SIZE]*read.Song, batchSize int) error {
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
		`
    insert into songs (
      track_number
      ,title
      ,artist
      ,album
      ,duration
      ,modified_date
      ,base_path
      ,relative_path
    )
    select * from unnest(
      $1::integer[]
      ,$2::varchar[]
      ,$3::varchar[]
      ,$4::varchar[]
      ,$5::integer[]
      ,$6::bigint[]
      ,$7::varchar[]
      ,$8::varchar[]
    )
    on conflict (base_path, relative_path) do update
    set
      track_number = excluded.track_number
      ,title = excluded.title
      ,artist = excluded.artist
      ,album = excluded.album
      ,duration = excluded.duration
      ,modified_date = excluded.modified_date
    `,
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
