package read

type Song struct {
	TrackNumber  int    `db:"track_number"`
	Title        string `db:"title"`
	Artist       string `db:"artist"`
	Album        string `db:"album"`
	Duration     int    `db:"duration"`
	BasePath     string `db:"base_path"`
	RelativePath string `db:"relative_path"`
	ModifiedDate int64  `db:"modified_date"`
}

type SongExternal struct {
	Id          int    `db:"id" json:"id"`
	TrackNumber int    `db:"track_number" json:"track"`
	Title       string `db:"title" json:"title"`
	Artist      string `db:"artist" json:"artist"`
	Album       string `db:"album" json:"album"`
	Duration    int    `db:"duration" json:"time"`
}

type File struct {
	RelativePath string `db:"relative_path"`
	ModifiedDate int64  `db:"modified_date"`
}
