package server_test

import (
	"encoding/json"

	"github.com/felamaslen/gmus-backend/pkg/server"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/alicebob/miniredis/v2"
	"github.com/elliotchance/redismock"
	"github.com/go-redis/redis"
)

func newTestRedis() *redismock.ClientMock {
	mr, err := miniredis.Run()
	if err != nil {
		panic(err)
	}

	client := redis.NewClient(&redis.Options{
		Addr: mr.Addr(),
	})

	return redismock.NewNiceMock(client)
}

var _ = Describe("Server actions", func() {
	var rdb *redismock.ClientMock
	BeforeEach(func() {
		rdb = newTestRedis()
		rdb.On("Publish").Return(redis.NewIntResult(0, nil))
	})

	Describe("PublishActionFromClient", func() {
		Describe("state set actions", func() {
			Context("when the action is valid", func() {
				var action server.Action
				json.Unmarshal([]byte(`
{
  "type": "STATE_SET",
  "payload": {
    "songId": 123,
    "playing": true,
    "currentTime": 94,
    "seekTime": -1,
    "queue": [],
    "master": "some-master-client"
  }
}
`), &action)
				myClient := "my-client"
				action.FromClient = &myClient

				songId := 123
				expectedAction := server.Action{
					Type:       server.StateSet,
					FromClient: &myClient,
					Payload: server.MusicPlayer{
						SongId:      &songId,
						Playing:     true,
						CurrentTime: 94,
						SeekTime:    -1,
						Master:      "some-master-client",
						Queue:       &[]int{},
					},
				}
				expectedActionString, jsonErr := json.Marshal(expectedAction)
				if jsonErr != nil {
					panic(jsonErr)
				}

				BeforeEach(func() {
					rdb.On("Publish", server.TOPIC_BROADCAST, expectedActionString).Return(redis.NewIntResult(0, nil))
				})

				It("should publish the action to the redis pubsub", func() {
					err := server.PublishActionFromClient(rdb, &action)
					Expect(rdb.Calls).NotTo(BeEmpty())
					Expect(err).To(BeNil())
				})
			})

			Context("when the song ID is non-positive", func() {
				var action server.Action
				json.Unmarshal([]byte(`
{
  "type": "STATE_SET",
  "payload": {
    "songId": 0,
    "playing": true,
    "currentTime": 94,
    "seekTime": -1,
    "queue": [],
    "master": "some-master-client"
  }
}
`), &action)

				It("should not publish a message", func() {
					err := server.PublishActionFromClient(rdb, &action)
					Expect(rdb.Calls).To(BeEmpty())
					Expect(err).NotTo(BeNil())
				})
			})

			Context("when the song ID is null", func() {
				var action server.Action
				json.Unmarshal([]byte(`
{
  "type": "STATE_SET",
  "payload": {
    "songId": null,
    "playing": false,
    "currentTime": 0,
    "seekTime": -1,
    "queue": [],
    "master": "some-master-client"
  }
}
`), &action)

				expectedAction := server.Action{
					Type: server.StateSet,
					Payload: server.MusicPlayer{
						SongId:      nil,
						Playing:     false,
						CurrentTime: 0,
						SeekTime:    -1,
						Master:      "some-master-client",
						Queue:       &[]int{},
					},
				}

				expectedActionString, jsonErr := json.Marshal(expectedAction)
				if jsonErr != nil {
					panic(jsonErr)
				}

				BeforeEach(func() {
					rdb.On("Publish", server.TOPIC_BROADCAST, expectedActionString).Return(redis.NewIntResult(0, nil))
				})

				It("should publish a message", func() {
					err := server.PublishActionFromClient(rdb, &action)
					Expect(rdb.Calls).NotTo(BeEmpty())
					Expect(err).To(BeNil())
				})
			})

			Context("when the current time is negative", func() {
				var action server.Action
				json.Unmarshal([]byte(`
{
  "type": "STATE_SET",
  "payload": {
    "songId": 123,
    "playing": false,
    "currentTime": -32,
    "seekTime": -1,
    "queue": [],
    "master": "some-master-client"
  }
}
`), &action)

				It("should not publish a message", func() {
					err := server.PublishActionFromClient(rdb, &action)
					Expect(rdb.Calls).To(BeEmpty())
					Expect(err).NotTo(BeNil())
				})
			})

			Context("when the seek time is less than -1", func() {
				var action server.Action
				json.Unmarshal([]byte(`
{
  "type": "STATE_SET",
  "payload": {
    "songId": 123,
    "playing": false,
    "currentTime": 13,
    "seekTime": -3,
    "queue": [],
    "master": "some-master-client"
  }
}
`), &action)

				It("should not publish a message", func() {
					err := server.PublishActionFromClient(rdb, &action)
					Expect(rdb.Calls).To(BeEmpty())
					Expect(err).NotTo(BeNil())
				})
			})

			Context("when the master is empty", func() {
				var action server.Action
				json.Unmarshal([]byte(`
{
  "type": "STATE_SET",
  "payload": {
    "songId": 123,
    "playing": false,
    "currentTime": 13,
    "seekTime": -3,
    "queue": [],
    "master": ""
  }
}
`), &action)

				It("should not publish a message", func() {
					err := server.PublishActionFromClient(rdb, &action)
					Expect(rdb.Calls).To(BeEmpty())
					Expect(err).NotTo(BeNil())
				})
			})
		})

		Describe("when the action is unrecognised", func() {
			var action server.Action
			// CLIENT_LIST_UPDATED should only ever come from the server
			err := json.Unmarshal([]byte(`
{
  "type": "CLIENT_LIST_UPDATED",
  "payload": [
    { "name": "client-a", "lastPing": 123 },
    { "name": "client-b", "lastPing": 456 }
  ]
}
`), &action)
			if err != nil {
				panic(err)
			}

			BeforeEach(func() {
				rdb.On("Publish", server.TOPIC_BROADCAST, "").Return(redis.NewIntResult(0, nil))
			})

			It("should not publish a message", func() {
				err := server.PublishActionFromClient(rdb, &action)
				Expect(rdb.Calls).To(BeEmpty())
				Expect(err).NotTo(BeNil())
			})
		})
	})
})
