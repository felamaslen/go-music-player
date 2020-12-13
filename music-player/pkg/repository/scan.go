package repository

import (
	"github.com/felamaslen/go-music-player/pkg/config"
	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/felamaslen/go-music-player/pkg/read"
	"github.com/lib/pq"
)

const BATCH_SIZE = 100
const LOG_EVERY = 100;

func InsertMusicIntoDatabase(songs chan *read.Song) {
  var l = logger.CreateLogger(config.GetConfig().LogLevel)

  db := database.GetConnection()

  var batch [BATCH_SIZE]*read.Song
  var batchSize = 0
  var numAdded = 0

  var processBatch = func() {
    if batchSize == 0 {
      return
    }

    l.Debug("[INSERT] Processing batch\n")

    var trackNumbers pq.Int64Array
    var titles pq.StringArray
    var artists pq.StringArray
    var albums pq.StringArray
    var durations pq.Int64Array

    var modifiedDates pq.Int64Array

    var basePaths pq.StringArray
    var relativePaths pq.StringArray

    for i := 0; i < batchSize; i++ {
      trackNumbers = append(trackNumbers, int64(batch[i].TrackNumber))
      titles = append(titles, batch[i].Title)
      artists = append(artists, batch[i].Artist)
      albums = append(albums, batch[i].Album)
      durations = append(durations, int64(batch[i].Duration))

      modifiedDates = append(modifiedDates, batch[i].ModifiedDate)

      basePaths = append(basePaths, batch[i].BasePath)
      relativePaths = append(relativePaths, batch[i].RelativePath)
    }

    db.MustExec(
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

    l.Debug("[INSERT] Processed batch\n")

    batchSize = 0
  }

  for {
    select {
    case song, more := <- songs:
      if !more {
        processBatch()
        l.Verbose("[INSERT] Finished inserting %d songs\n", numAdded)
        return
      }

      batch[batchSize] = song
      batchSize++

      numAdded++
      if numAdded % LOG_EVERY == 0 {
        l.Verbose("[INSERT] Inserted %d\n", numAdded)
      }

      if batchSize >= BATCH_SIZE {
        processBatch()
      }
    }
  }
}
