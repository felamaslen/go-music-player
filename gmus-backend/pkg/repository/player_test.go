package repository_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/repository"
	"github.com/felamaslen/gmus-backend/pkg/testing"
	"github.com/felamaslen/gmus-backend/pkg/types"
)

var _ = Describe("Player repository", func() {
	db := database.GetConnection()

	var ids []int

	BeforeEach(func() {
		testing.PrepareDatabaseForTesting()

		rows, err := db.Queryx(
			`
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
        array[1, 1, 2, 4, 0, 0]
        ,array['T1', 'T2', 'T3', 'T4', '', '']
        ,array['AR1', 'AR2', 'AR1', 'AR1', '', '']
        ,array['AL1', 'AL2', 'AL1', 'AL3', '', '']
        ,array[100, 200, 300, 250, 103, 107]
        ,array[123, 456, 789, 120, 883, 1443]
        ,array['/music', '/music', '/music', '/music', '/music', '/music']
        ,array['file1.ogg', 'file2.ogg', 'file3.ogg', 'file4.ogg', 'file5.ogg', 'file6.ogg']
      )
      returning id
      `,
		)
		if err != nil {
			panic(err)
		}

		var id int
		ids = []int{}

		for rows.Next() {
			rows.Scan(&id)
			ids = append(ids, id)
		}
		rows.Close()
	})

	Describe("GetNextSong", func() {
		Context("when another song exists in the same album", func() {
			It("should return the correct song ID", func() {
				song, _ := repository.GetNextSong(db, ids[0])
				Expect(song.Id).To(Equal(ids[2]))
			})
		})

		Context("when another song exists from the same artist", func() {
			It("should return the correct song ID", func() {
				song, _ := repository.GetNextSong(db, ids[2])
				Expect(song.Id).To(Equal(ids[3]))
			})
		})

		Context("when another song exists by a different artist", func() {
			It("should return the correct song ID", func() {
				song, _ := repository.GetNextSong(db, ids[3])
				Expect(song.Id).To(Equal(ids[1]))
			})
		})

		Context("when no further songs exist", func() {
			It("should return zero", func() {
				song, _ := repository.GetNextSong(db, ids[1])
				Expect(song.Id).To(Equal(0))
			})
		})

		Context("when the song has no information", func() {
			It("should return the next song by ID", func() {
				song, _ := repository.GetNextSong(db, ids[4])
				Expect(song.Id).To(Equal(ids[5]))
			})
		})

		Context("when the ID does not exist", func() {
			It("should return nil", func() {
				song, err := repository.GetNextSong(db, 10000000)

				Expect(err).To(BeNil())
				Expect(song.Id).To(BeZero())
			})
		})
	})

	Describe("GetPrevSong", func() {
		Context("when another song exists in the same album", func() {
			It("should return the correct song ID", func() {
				song, _ := repository.GetPrevSong(db, ids[2])
				Expect(song.Id).To(Equal(ids[0]))
			})
		})

		Context("when another song exists from the same artist", func() {
			It("should return the correct song ID", func() {
				song, _ := repository.GetPrevSong(db, ids[3])
				Expect(song.Id).To(Equal(ids[2]))
			})
		})

		Context("when another song exists by a different artist", func() {
			It("should return the correct song ID", func() {
				song, _ := repository.GetPrevSong(db, ids[1])
				Expect(song.Id).To(Equal(ids[3]))
			})
		})

		Context("when the song has no information", func() {
			It("should return the previous song by ID", func() {
				song, _ := repository.GetPrevSong(db, ids[5])
				Expect(song.Id).To(Equal(ids[4]))
			})
		})

		Context("when no further songs exist", func() {
			It("should return zero", func() {
				song, _ := repository.GetPrevSong(db, ids[4])
				Expect(song.Id).To(Equal(0))
			})
		})

		Context("when the ID does not exist", func() {
			It("should return nil", func() {
				song, err := repository.GetPrevSong(db, 10000000)

				Expect(err).To(BeNil())
				Expect(song.Id).To(BeZero())
			})
		})
	})

	Describe("GetShuffledSong", func() {
		It("should return a random song", func() {
			result, _ := repository.GetShuffledSong(db, &ids[0])
			Expect(result).NotTo(BeNil())
			Expect(result.Id).To(BeElementOf(ids))
		})

		It("should not return the given song", func() {
			// Iterate 10 times to be quite confident - it's not a mathematical proof
			// but it doesn't need to be
			for i := 0; i < 10; i++ {
				result0, _ := repository.GetShuffledSong(db, &ids[0])
				result4, _ := repository.GetShuffledSong(db, &ids[4])

				Expect(result0).NotTo(BeNil())
				Expect(result4).NotTo(BeNil())

				Expect(result0.Id).NotTo(Equal(ids[0]))
				Expect(result4.Id).NotTo(Equal(ids[4]))
			}
		})

		Context("when no currentSongId is given", func() {
			It("should return a random song", func() {
				result, _ := repository.GetShuffledSong(db, nil)
				Expect(result).NotTo(BeNil())
				Expect(result.Id).To(BeElementOf(ids))
			})
		})

		Context("when there are no songs in the database", func() {
			BeforeEach(func() {
				db.MustExec(`truncate songs`)
			})

			It("should return an empty result", func() {
				result, err := repository.GetShuffledSong(db, nil)
				Expect(err).To(BeNil())
				Expect(result).To(Equal(&types.Song{
					Id: 0,
				}))
			})
		})
	})
})
