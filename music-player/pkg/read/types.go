package read

type Song struct {
  Title string 		`db:"title"`
  Artist string 	`db:"artist"`
  Album string 		`db:"album"`
  Duration int 		`db:"duration"`
  DurationOk bool
  BasePath string 	`db:"base_path"`
  RelativePath string 	`db:"relative_path"`
}
