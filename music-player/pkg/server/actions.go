package server

import (
	"encoding/json"

	"github.com/felamaslen/go-music-player/pkg/logger"
	"github.com/go-redis/redis/v7"
)

type ActionType string

const (
	StateSet          ActionType = "STATE_SET"
	ClientListUpdated            = "CLIENT_LIST_UPDATED"
)

type Action struct {
	Type       ActionType  `json:"type"`
	FromClient *string     `json:"fromClient"`
	Payload    interface{} `json:"payload"`
}

func broadcastAction(l *logger.Logger, thisPodClients *map[string]*Client, action *Action) []error {
	var errors []error

	for _, client := range *thisPodClients {
		l.Debug("[->Client] %s (%s)\n", action.Type, client.name)
		if err := client.send(action); err != nil {
			errors = append(errors, err)
		}
	}

	return errors
}

func publishAction(rdb *redis.Client, action *Action) error {
	pubsubPayload, err := json.Marshal(action)
	if err != nil {
		return err
	}
	if _, err := rdb.Publish(TOPIC_BROADCAST, pubsubPayload).Result(); err != nil {
		return err
	}
	return nil
}
