package services

import (
	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/repository"
)

func GetArtists(limit int, page int) (artists *[]string, more bool) {
	db := database.GetConnection()

	artists, err := repository.SelectPagedArtists(db, limit, limit*page)
	if err != nil {
		panic(err)
	}

	total, err := repository.SelectArtistCount(db)
	if err != nil {
		panic(err)
	}

	more = limit*(1+page) < total

	return
}
