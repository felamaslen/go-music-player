package logger

import (
	"fmt"
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

func (l *Logger) printf(level string, str string, args ...interface{}) {
	log.Printf(fmt.Sprintf("[%s] %s", level, str), args...)
}

func (l *Logger) Fatal(str string, args ...interface{}) {
	log.Fatalf(str, args...)
}

func (l *Logger) Error(str string, args ...interface{}) {
	if l.Level >= LevelError {
		l.printf("error", str, args...)
	}
}

func (l *Logger) Warn(str string, args ...interface{}) {
	if l.Level >= LevelWarn {
		l.printf("warn", str, args...)
	}
}

func (l *Logger) Info(str string, args ...interface{}) {
	if l.Level >= LevelInfo {
		l.printf("info", str, args...)
	}
}

func (l *Logger) Verbose(str string, args ...interface{}) {
	if l.Level >= LevelVerbose {
		l.printf("verbose", str, args...)
	}
}

func (l *Logger) Debug(str string, args ...interface{}) {
	if l.Level >= LevelDebug {
		l.printf("debug", str, args...)
	}
}

func CreateLogger(level LogLevel) *Logger {
	var l = Logger{
		Level: level,
	}

	return &l
}
