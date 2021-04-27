package repository_test

import (
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/repository"
	setup "github.com/felamaslen/gmus-backend/pkg/testing"
	"github.com/felamaslen/gmus-backend/pkg/types"
)

var _ = Describe("Scan repository", func() {
	db := database.GetConnection()

	BeforeEach(func() {
		setup.PrepareDatabaseForTesting()
	})

	Describe("InsertScanError", func() {
		BeforeEach(func() {
			repository.InsertScanError(db, &types.ScanError{
				CreatedAt:    time.Date(2021, 4, 20, 11, 17, 25, 0, time.UTC),
				BasePath:     "/my/base/path",
				RelativePath: "path/to/file.ogg",
				Error:        "File does not exist or something",
			})
		})

		It("should insert the error into the database", func() {
			var result []*types.ScanError
			db.Select(&result, `
			select created_at, base_path, relative_path, error
			from scan_errors
			`)

			Expect(result).To(HaveLen(1))
			Expect(result[0]).To(Equal(&types.ScanError{
				CreatedAt:    time.Date(2021, 4, 20, 11, 17, 25, 0, time.UTC).In(time.Local),
				BasePath:     "/my/base/path",
				RelativePath: "path/to/file.ogg",
				Error:        "File does not exist or something",
			}))
		})
	})

	// Note; SelectNewOrUpdatedFiles logic is tested via pkg/read/files_test.go
})
