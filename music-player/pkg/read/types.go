package read

type Song struct {
  TrackNumber int 	`db:"track_number"`
  Title string 		`db:"title"`
  Artist string 	`db:"artist"`
  Album string 		`db:"album"`
  Duration int 		`db:"duration"`
  DurationOk bool
  BasePath string 	`db:"base_path"`
  RelativePath string 	`db:"relative_path"`
  ModifiedDate int64 	`db:"modified_date"` 
}

type File struct {
  RelativePath string 	`db:"relative_path"`
  ModifiedDate int64 	`db:"modified_date"`
}
