package repository

import (
	"github.com/felamaslen/gmus-backend/pkg/types"
	"github.com/lib/pq"

	"github.com/jmoiron/sqlx"
)

func InsertScanError(db *sqlx.DB, scanError *types.ScanError) (err error) {
	_, err = db.Exec(queryInsertScanError, scanError.CreatedAt, scanError.BasePath, scanError.RelativePath, scanError.Error)
	return
}

func SelectNewOrUpdatedFiles(db *sqlx.DB, relativePaths pq.StringArray, modifiedDates pq.Int64Array, basePath string) (result *sqlx.Rows, err error) {
	result, err = db.Queryx(
		querySelectNewOrUpdatedFiles,
		relativePaths,
		modifiedDates,
		basePath,
	)
	return
}
