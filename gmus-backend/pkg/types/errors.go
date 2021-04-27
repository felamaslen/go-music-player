package types

import "time"

type ScanError struct {
	Id           int       `db:"id"`
	CreatedAt    time.Time `db:"created_at"`
	BasePath     string    `db:"base_path"`
	RelativePath string    `db:"relative_path"`
	Error        string    `db:"error"`
}
