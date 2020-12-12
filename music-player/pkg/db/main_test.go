package db

import (
  "context"
  "testing"
)

func TestDbIntegration(t *testing.T) {
  conn := PrepareDatabaseForTesting()
  defer conn.Conn().Close(context.Background())

  t.Run("Scanning and inserting songs", IntegrationTestInsertMusicIntoDatabase)
}
