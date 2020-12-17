package services_test

import (
	"fmt"

	"github.com/lib/pq"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/felamaslen/go-music-player/pkg/database"
	"github.com/felamaslen/go-music-player/pkg/services"
	setup "github.com/felamaslen/go-music-player/pkg/testing"
)

var _ = Describe("Fetching data", func() {
	db := database.GetConnection()

	BeforeEach(func() {
		setup.PrepareDatabaseForTesting()
	})

	Describe("getArtists", func() {
		var insertArtists = func(artists []string) {
			var trackNumbers = make([]int, len(artists))
			var titles = make([]string, len(artists))
			var albums = make([]string, len(artists))
			var durations = make([]int, len(artists))
			var basePaths = make([]string, len(artists))
			var relativePaths = make([]string, len(artists))
			var modifiedDates = make([]int, len(artists))

			for i := 0; i < len(artists); i++ {
				trackNumbers[i] = i + 1
				titles[i] = fmt.Sprintf("Title %d", i+1)
				albums[i] = fmt.Sprintf("Album %d", i+1)
				durations[i] = 403 + i
				basePaths[i] = "/music"
				relativePaths[i] = fmt.Sprintf("file%d.ogg", i)
				modifiedDates[i] = 177712347 + i
			}

			db.MustExec(
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
	  $1::integer[]
	  ,$2::varchar[]
	  ,$3::varchar[]
	  ,$4::varchar[]
	  ,$5::integer[]
	  ,$6::bigint[]
	  ,$7::varchar[]
	  ,$8::varchar[]
	)
	`,
				pq.Array(trackNumbers),
				pq.Array(titles),
				pq.Array(artists),
				pq.Array(albums),
				pq.Array(durations),
				pq.Array(modifiedDates),
				pq.Array(basePaths),
				pq.Array(relativePaths),
			)
		}

		Context("when there are no songs", func() {
			It("should return an empty slice and set more to false", func() {
				artists, more := services.GetArtists(100, 0)

				Expect(*artists).To(HaveLen(0))
				Expect(more).To(BeFalse())
			})
		})

		Context("when there are no songs with artists", func() {
			BeforeEach(func() {
				insertArtists([]string{"", ""})
			})

			It("should return an empty string", func() {
				artists, more := services.GetArtists(100, 0)

				Expect(*artists).To(HaveLen(1))
				Expect((*artists)[0]).To(Equal(""))
				Expect(more).To(BeFalse())
			})
		})

		Context("when there are fewer artists than the limit given", func() {
			BeforeEach(func() {
				insertArtists([]string{"Artist A", "Artist B", "Artist C", "Artist D"})
			})

			It("should return an ordered set matching the limit", func() {
				artists, _ := services.GetArtists(3, 0)

				Expect(*artists).To(HaveLen(3))

				Expect((*artists)[0]).To(Equal("Artist A"))
				Expect((*artists)[1]).To(Equal("Artist B"))
				Expect((*artists)[2]).To(Equal("Artist C"))
			})

			It("should set more to true", func() {
				_, more := services.GetArtists(3, 0)

				Expect(more).To(BeTrue())
			})

			Context("when paging", func() {
				It("should return the next set of results", func() {
					artists, _ := services.GetArtists(3, 1)

					Expect(*artists).To(HaveLen(1))
					Expect((*artists)[0]).To(Equal("Artist D"))
				})

				It("should set more to false at the end", func() {
					_, more := services.GetArtists(3, 1)

					Expect(more).To(BeFalse())
				})
			})
		})
	})
})
