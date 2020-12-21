package server

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/felamaslen/gmus-backend/pkg/logger"
	"github.com/go-playground/validator/v10"
	"github.com/go-redis/redis"
)

type ActionType string

const (
	StateSet          ActionType = "STATE_SET"
	ClientListUpdated ActionType = "CLIENT_LIST_UPDATED"
)

type Action struct {
	Type       ActionType  `json:"type"`
	FromClient *string     `json:"fromClient"`
	Payload    interface{} `json:"payload"`
}

func BroadcastAction(l *logger.Logger, thisPodClients *map[string]*Client, action *Action) []error {
	var errors []error

	for _, client := range *thisPodClients {
		l.Debug("[->Client] %s (%s)\n", action.Type, client.name)
		if err := client.send(action); err != nil {
			errors = append(errors, err)
		}
	}

	return errors
}

func validateAction(action *Action) (validatedAction *Action, err error) {
	switch action.Type {
	case StateSet:
		var remarshaledPayload []byte
		remarshaledPayload, err = json.Marshal(action.Payload)
		if err != nil {
			return
		}

		var playerState MusicPlayer
		err = json.Unmarshal(remarshaledPayload, &playerState)
		if err != nil {
			return
		}

		v := validator.New()
		err = v.Struct(playerState)
		if err != nil {
			err = errors.New(err.Error())
			return
		}

		validatedAction = &Action{
			Type:       StateSet,
			FromClient: action.FromClient,
			Payload:    playerState,
		}
		return
	default:
		err = errors.New(fmt.Sprintf("Invalid client action type: %s", action.Type))
		return
	}
}

func PublishAction(rdb redis.Cmdable, action []byte) error {
	if _, err := rdb.Publish(TOPIC_BROADCAST, action).Result(); err != nil {
		return err
	}
	return nil
}

func PublishActionFromClient(rdb redis.Cmdable, action *Action) error {
	validatedAction, validationErr := validateAction(action)
	if validationErr != nil {
		return validationErr
	}

	pubsubPayload, err := json.Marshal(validatedAction)
	if err != nil {
		return err
	}

	return PublishAction(rdb, pubsubPayload)
}
