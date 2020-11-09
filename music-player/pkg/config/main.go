package config

import (
  "os"
  "log"
  "fmt"
  "strconv"
  "path/filepath"

  "github.com/joho/godotenv"
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

func loadEnv() {
  envFileBase, loadEnvFile := getEnvFile()
  cwd, _ := os.Getwd()
  envFile := filepath.Join(cwd, envFileBase)
  if loadEnvFile {
    err := godotenv.Load(envFile)
    if err != nil {
      log.Fatal("Error loading dotenv file: ", err)
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

type config struct {
  DatabaseUrl string
}

func getConfig() config {
  loadEnv()

  return config{
    DatabaseUrl: getDatabaseUrl(),
  }
}

var Config = getConfig()
