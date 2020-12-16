package repository

import (
	"errors"

	"github.com/felamaslen/go-music-player/pkg/read"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

const BATCH_SIZE = 100

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
  order by track_number, title, album
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
