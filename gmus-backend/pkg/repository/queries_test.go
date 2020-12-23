package repository_test

const testQueryInsertHeyJude = `
insert into songs (track_number, title, artist, album, duration, modified_date, base_path, relative_path)
values ($1, $2, $3, $4, $5, $6, $7, $8)
returning id
`

const testQueryInsertTrack1 = `
insert into songs (track_number, title, artist, album, duration, modified_date, base_path, relative_path)
values ($1, $2, $3, $4, $5, $6, $7, $8)
returning id
`

const testQuerySelectAllSongs = `
select track_number, title, artist, album, duration, base_path, relative_path, modified_date
from songs
`

const testQuerySelectSong12 = `
select track_number, title, artist, album, duration, base_path, relative_path, modified_date
from songs
where relative_path in ('song1.ogg', 'song2.ogg')
`
