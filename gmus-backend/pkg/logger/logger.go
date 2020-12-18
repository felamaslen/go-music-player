package logger

import (
	"log"
)

type LogLevel int

const (
	LevelNone    LogLevel = 0
	LevelError   LogLevel = 1
	LevelWarn    LogLevel = 2
	LevelInfo    LogLevel = 3
	LevelVerbose LogLevel = 4
	LevelDebug   LogLevel = 5
)

type Logger struct {
	Level LogLevel
}

func (l *Logger) Printf(str string, args ...interface{}) {
	log.Printf(str, args...)
}

func (l *Logger) Fatal(str string, args ...interface{}) {
	log.Fatalf(str, args...)
}

func (l *Logger) Error(str string, args ...interface{}) {
	if l.Level >= LevelError {
		l.Printf(str, args...)
	}
}

func (l *Logger) Warn(str string, args ...interface{}) {
	if l.Level >= LevelWarn {
		l.Printf(str, args...)
	}
}

func (l *Logger) Info(str string, args ...interface{}) {
	if l.Level >= LevelInfo {
		l.Printf(str, args...)
	}
}

func (l *Logger) Verbose(str string, args ...interface{}) {
	if l.Level >= LevelVerbose {
		l.Printf(str, args...)
	}
}

func (l *Logger) Debug(str string, args ...interface{}) {
	if l.Level >= LevelDebug {
		l.Printf(str, args...)
	}
}

func CreateLogger(level LogLevel) *Logger {
	var l = Logger{
		Level: level,
	}

	return &l
}
