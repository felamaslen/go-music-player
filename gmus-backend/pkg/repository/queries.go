package repository

const querySelectSongById = `
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
`

const querySelectArtistsOrdered = `
select distinct artist
from songs
order by artist
limit $1
offset $2
`

const queryCountArtists = `
select count(*) as count from (
  select distinct artist from songs
) distinct_artists
`

const querySelectAlbumsByArtist = `
select distinct album
from songs
where artist = $1
order by album
`

const querySelectSongsByArtist = `
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
`

const queryInsertSongs = `
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
`

const queryDeleteSongByPath = `
delete from songs
where base_path = $1 and relative_path = $2
`

const querySelectNextSong = `
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
`

const querySelectPrevSong = `
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
`

const querySelectFirstShuffledSong = `
select
	s.id
	,s.track_number
	,s.title
	,s.artist
	,s.album
	,s.duration
from songs s
limit 1
offset floor(random() * (select count(*) from songs))
`

const querySelectNextShuffledSong = `
select
	s.id
	,s.track_number
	,s.title
	,s.artist
	,s.album
	,s.duration
from songs s
where s.id != $1
limit 1
offset floor(random() * greatest(0, ((select count(*) from songs) - 1)))
`

const queryInsertScanError = `
insert into scan_errors (created_at, base_path, relative_path, error)
values ($1, $2, $3, $4)
`

const querySelectNewOrUpdatedFiles = `
with all_files as (
	select * from unnest($1::varchar[], $2::bigint[])
	as t(relative_path, modified_date)
)
select r.relative_path, r.modified_date
from all_files r
left join songs on
	songs.base_path = $3
	and songs.relative_path = r.relative_path
	and songs.modified_date = r.modified_date
left join scan_errors e on
	e.base_path = $3
	and e.relative_path = r.relative_path
where songs.id is null
	and e.id is null
`
