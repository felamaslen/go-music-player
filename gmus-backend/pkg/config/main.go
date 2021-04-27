package config

import "os"

func GetConfig() config {
	if !envLoaded {
		loadEnv()
	}

	return config{
		DatabaseUrl:      getDatabaseUrl(),
		LogLevel:         getLogLevel(),
		LibraryDirectory: os.Getenv("LIBRARY_DIRECTORY"),
		LibraryWatch:     getLibraryWatch(),
		Host:             getListenHost(),
		Port:             getPort(),
		RedisUrl:         getRedisUrl(),
		AllowedOrigins:   getAllowedOrigins(),
	}
}
