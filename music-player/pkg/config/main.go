package config

import (
  "os"

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

func LoadEnv() {
  envFile, loadEnvFile := getEnvFile()
  if loadEnvFile {
    godotenv.Load(envFile)
  }
}
