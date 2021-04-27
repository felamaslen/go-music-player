package read

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/felamaslen/gmus-backend/pkg/database"
	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/felamaslen/gmus-backend/pkg/repository"
	"github.com/felamaslen/gmus-backend/pkg/types"
	"github.com/fsnotify/fsnotify"
	"github.com/jmoiron/sqlx"
)

// Watch file system for real time updates

var watcher *fsnotify.Watcher

func watchDir(path string, fi os.FileInfo, err error) error {
	if fi.Mode().IsDir() {
		return watcher.Add(path)
	}
	return nil
}

func getRelativePath(fileName string, rootDirectory string) (relativePath string, err error) {
	if strings.Index(fileName, rootDirectory) != 0 {
		return "", fmt.Errorf("File is not in root directory")
	}
	if len(fileName) < len(rootDirectory)+1 {
		return "", fmt.Errorf("File is empty apart from root directory")
	}
	relativePath = (fileName[len(rootDirectory)+1:])
	return
}

func handleFileRemoveOrRename(l *logger.Logger, db *sqlx.DB, rootDirectory string, event fsnotify.Event) {
	relativePath, err := getRelativePath(event.Name, rootDirectory)
	if err != nil {
		l.Warn("[WATCH] delete error: %v\n", err)
		return
	}

	l.Verbose("[WATCH] delete: basePath=%s, relativePath=%s\n", rootDirectory, relativePath)
	watcher.Remove(event.Name)
	repository.DeleteSongByPath(db, rootDirectory, relativePath)
	return
}

// This is an ugly hack to wait until a file has completed writing, since fsnotify
// doesn't support the IN_CLOSE_WRITE event
// See this and related issues: https://github.com/fsnotify/fsnotify/pull/313, https://github.com/fsnotify/fsnotify/issues/22
const WRITE_WAIT_TIME = 2 * time.Second

var writeWaitMap = map[string]*time.Timer{}

func handleFileOnceWritten(l *logger.Logger, db *sqlx.DB, rootDirectory string, filePath string) {
	relativePath, err := getRelativePath(filePath, rootDirectory)
	l.Verbose("[WATCH] create: basePath=%s, relativePath=%s\n", rootDirectory, relativePath)

	if err != nil {
		l.Warn("[WATCH] invalid path: %v\n", err)
		return
	}

	file, err := os.Stat(filePath)
	if err != nil {
		l.Warn("[WATCH] error reading file: %v\n", err)
		return
	}
	if file.IsDir() {
		return
	}

	validFile := GetFileInfo(file, relativePath)
	if validFile == nil {
		l.Warn("[WATCH] invalid file: %s\n", filePath)
		return
	}
	song, err := ReadFile(rootDirectory, validFile)
	if err != nil {
		l.Warn("[WATCH] error scanning file (file: %v): %v\n", validFile, err)
		return
	}

	var batch [BATCH_SIZE]*types.Song
	batch[0] = song
	if err := repository.BatchUpsertSongs(db, &batch, 1); err != nil {
		l.Error("[WATCH] error adding file: %v\n", err)
	}
}

func waitUntilFileIsWritten(l *logger.Logger, db *sqlx.DB, rootDirectory string, event fsnotify.Event) {
	var filePath = event.Name

	if writeWaitMap[filePath] != nil {
		writeWaitMap[filePath].Stop()
	}
	writeWaitMap[filePath] = time.NewTimer(WRITE_WAIT_TIME)

	go func() {
		<-writeWaitMap[filePath].C
		handleFileOnceWritten(l, db, rootDirectory, filePath)
		delete(writeWaitMap, filePath)
	}()
}

func handleFileCreateEvent(l *logger.Logger, db *sqlx.DB, rootDirectory string, event fsnotify.Event) {
	filePath := event.Name
	file, err := os.Stat(filePath)
	if err != nil {
		l.Warn("[WATCH] error reading file: %v\n", err)
		return
	}
	if file.IsDir() {
		l.Verbose("[WATCH] adding directory to watcher: %s\n", filePath)
		watcher.Add(filePath)
	} else {
		waitUntilFileIsWritten(l, db, rootDirectory, event)
	}
}

func handleWatcherEvent(l *logger.Logger, db *sqlx.DB, rootDirectory string, event fsnotify.Event) {
	switch event.Op {
	case fsnotify.Remove:
		handleFileRemoveOrRename(l, db, rootDirectory, event)
	case fsnotify.Rename:
		handleFileRemoveOrRename(l, db, rootDirectory, event)
	case fsnotify.Create:
		handleFileCreateEvent(l, db, rootDirectory, event)
	case fsnotify.Write:
		waitUntilFileIsWritten(l, db, rootDirectory, event)
	}
}

func WatchLibraryRecursive(l *logger.Logger, rootDirectory string) {
	watcher, _ = fsnotify.NewWatcher()
	defer watcher.Close()

	if err := filepath.Walk(rootDirectory, watchDir); err != nil {
		l.Error("[WATCH] walk error: %s\n", err.Error())
	}

	db := database.GetConnection()

	done := make(chan bool)
	go func() {
		for {
			select {
			case event := <-watcher.Events:
				handleWatcherEvent(l, db, rootDirectory, event)
			case err := <-watcher.Errors:
				l.Error("[WATCH] error: %v\n", err)
			}
		}
	}()

	<-done
}
