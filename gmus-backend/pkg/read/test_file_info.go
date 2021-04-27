package read

import "github.com/felamaslen/gmus-backend/pkg/types"

const TestDirectory = "pkg/read/testdata"

var TestSong = types.Song{
	TrackNumber:  23,
	Title:        "Impact Moderato",
	Artist:       "Kevin MacLeod",
	Album:        "YouTube Audio Library",
	Duration:     74,
	BasePath:     TestDirectory,
	RelativePath: "file_example_OOG_1MG.ogg",
}

var TestSongNested = types.Song{
	TrackNumber:  14,
	Title:        "Clementi: Piano Sonata in D major, Op 25 No 6 - Movement 2: Un poco andante",
	Artist:       "Howard Shelley",
	Album:        "Clementi: The Complete Piano Sonatas, Vol. 4",
	Duration:     166,
	BasePath:     TestDirectory,
	RelativePath: "nested/14 Clementi Piano Sonata in D major, Op 25 No 6 - Movement 2 Un poco andante.ogg",
}
