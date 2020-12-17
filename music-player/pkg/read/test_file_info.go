package read

const TestDirectory = "pkg/read/testdata"

var TestSong = Song{
	TrackNumber:  23,
	Title:        "Impact Moderato",
	Artist:       "Kevin MacLeod",
	Album:        "YouTube Audio Library",
	Duration:     74,
	BasePath:     TestDirectory,
	RelativePath: "file_example_OOG_1MG.ogg",
}

var TestSongNested = Song{
	TrackNumber:  14,
	Title:        "Clementi: Piano Sonata in D major, Op 25 No 6 - Movement 2: Un poco andante",
	Artist:       "Howard Shelley",
	Album:        "Clementi: The Complete Piano Sonatas, Vol. 4",
	Duration:     166,
	BasePath:     TestDirectory,
	RelativePath: "nested/14 Clementi Piano Sonata in D major, Op 25 No 6 - Movement 2 Un poco andante.ogg",
}
