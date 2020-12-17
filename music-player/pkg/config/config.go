package config

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"

	"github.com/joho/godotenv"

	"github.com/felamaslen/go-music-player/pkg/logger"
)

var envLoaded = false

func getEnvFile() (string, bool) {
	goEnv, _ := os.LookupEnv("GO_ENV")

	switch goEnv {
	case "test":
		return "test.env", true
	case "development":
		return ".env", true
	default:
		return "", false
	}
}

func loadEnv() {
	envFileBase, loadEnvFile := getEnvFile()
	cwd, _ := os.Getwd()
	envFile := filepath.Join(cwd, envFileBase)
	if loadEnvFile {
		err := godotenv.Load(envFile)
		if err != nil {
			log.Printf("Error loading dotenv file: %v\n", err)
		} else {
			envLoaded = true
		}
	}
}

func getDatabaseUrl() string {
	host, hasHost := os.LookupEnv("POSTGRES_HOST")
	if !hasHost {
		log.Fatal("Must set POSTGRES_HOST")
	}

	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	port, hasPort := os.LookupEnv("POSTGRES_PORT")
	if !hasPort {
		port = "5432"
	}
	portNumeric, err := strconv.Atoi(port)
	if err != nil {
		log.Fatal("POSTGRES_PORT must be numeric")
	}

	database, hasDatabase := os.LookupEnv("POSTGRES_DATABASE")
	if !hasDatabase {
		log.Fatal("Must set POSTGRES_DATABASE")
	}

	databaseUrl := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable", user, password, host, portNumeric, database)

	return databaseUrl
}

const defaultLogLevel = logger.LevelInfo

func getLogLevel() logger.LogLevel {
	level, hasLevel := os.LookupEnv("LOG_LEVEL")
	if !hasLevel {
		return defaultLogLevel
	}
	levelInt, err := strconv.Atoi(level)
	if err != nil {
		return defaultLogLevel
	}
	switch levelInt {
	case 0:
		return logger.LevelNone
	case 1:
		return logger.LevelError
	case 2:
		return logger.LevelWarn
	case 3:
		return logger.LevelInfo
	case 4:
		return logger.LevelVerbose
	case 5:
		return logger.LevelDebug
	}
	return defaultLogLevel
}

func getPort() int {
	var defaultPort = 3000
	port, hasPort := os.LookupEnv("PORT")
	if !hasPort {
		return defaultPort
	}
	result, err := strconv.Atoi(port)
	if err != nil {
		return defaultPort
	}
	return result
}

func getRedisUrl() string {
	url, hasUrl := os.LookupEnv("REDIS_URL")
	if !hasUrl {
		return "localhost:6379"
	}
	return url
}

type config struct {
	DatabaseUrl      string
	LogLevel         logger.LogLevel
	LibraryDirectory string
	Port             int
	RedisUrl         string
}
