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

var envLoaded = false

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

  databaseUrl := fmt.Sprintf("postgres://%s:%s@%s:%d/%s", user, password, host, portNumeric, database)

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

type config struct {
  DatabaseUrl string
  LogLevel logger.LogLevel
}

func GetConfig() config {
  if !envLoaded {
    loadEnv()
  }

  return config{
    DatabaseUrl: getDatabaseUrl(),
    LogLevel: getLogLevel(),
  }
}
