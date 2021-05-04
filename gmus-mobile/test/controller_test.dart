import 'package:flutter_test/flutter_test.dart';
import 'package:gmus/actions.dart';
import 'package:gmus/controller.dart';
import 'package:gmus/socket.dart';
import 'package:mockito/mockito.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

void main() {
  group('Controller', () {
    group('Receiving messages from pubsub', () {
      group(CLIENT_LIST_UPDATED, () {
        String message = '{"type":"CLIENT_LIST_UPDATED","payload":[{"name":"client-A","lastPing":123},{"name":"client-B","lastPing":456}]}';

        test('client list should be updated', () {
          Controller controller = Controller();

          onRemoteMessage(controller, message);

          expect(controller.clients.length, 2);

          expect(controller.clients[0].name, 'client-A');
          expect(controller.clients[0].lastPing, 123);

          expect(controller.clients[1].name, 'client-B');
          expect(controller.clients[1].lastPing, 456);
        });
      });

      group(STATE_SET, () {
        String message = '{"type":"STATE_SET","payload":{"master":"new-master-client","activeClients":["some-client"],"songId":7123,"currentTime":10.843,"seekTime":23.001,"playing":false,"queue":[9750],"shuffleMode":true}}';

        test('player state should be updated', () {
          Controller controller = Controller();
          onRemoteMessage(controller, message);

          expect(controller.player.value.master, 'new-master-client');
          expect(controller.player.value.songId, 7123);
          expect(controller.player.value.currentTime, 10.843);
          expect(controller.player.value.seekTime, 23.001);
          expect(controller.player.value.playing, false);
          expect(controller.player.value.shuffleMode, true);
        });

        test('queue should be updated', () {
          Controller controller = Controller();
          onRemoteMessage(controller, message);

          expect(controller.player.value.queue.length, 1);
          expect(controller.player.value.queue[0], 9750);
        });

        test('active clients should be updated', () {
          Controller controller = Controller();
          onRemoteMessage(controller, message);

          expect(controller.player.value.activeClients.length, 1);
          expect(controller.player.value.activeClients[0], 'some-client');
        });
      });
    });

    group('Play / pause', () {
      group('When slave', () {
        group('when paused', () {
          test('should send a "play" action to pubsub', () {
            var controller = mockControllerAsSlave();
            controller.player.value.playing = false;

            controller.playPause();

            verify(controller.socket.channel.sink.add('{"type":"STATE_SET","priority":0,"payload":{"songId":null,"playing":true,"currentTime":0.0,"seekTime":-1.0,"master":"other-client-name-master","activeClients":[],"queue":[],"shuffleMode":false}}')).called(1);
          });
        });

        group('when playing', () {
          test('should send a "pause" action to pubsub', () {
            var controller = mockControllerAsSlave();
            controller.player.value.playing = true;
            controller.player.value.songId = 182;

            controller.playPause();

            verify(controller.socket.channel.sink.add('{"type":"STATE_SET","priority":0,"payload":{"songId":182,"playing":false,"currentTime":0.0,"seekTime":-1.0,"master":"other-client-name-master","activeClients":[],"queue":[],"shuffleMode":false}}')).called(1);
          });
        });
      });

      group('When master', () {
        test('should not send any actions to pubsub', () {
          var controller = mockControllerAsMaster();
          controller.player.value.playing = false;
          controller.playPause();

          verifyNever(controller.socket.channel.sink.add('{"type":"STATE_SET","priority":0,"payload":{"songId":null,"playing":true,"currentTime":0.0,"seekTime":-1.0,"master":"other-client-name-master","activeClients":[],"queue":[],"shuffleMode":false}}'));
        });
      });
    });

    group('Playing a song', () {
      group('When slave', () {
        test('should send an action to pubsub to play the song', () {
          var controller = mockControllerAsSlave();

          controller.playSong(871);

          verify(controller.socket.channel.sink.add('{"type":"STATE_SET","priority":0,"payload":{"songId":871,"playing":true,"currentTime":0.0,"seekTime":-1.0,"master":"other-client-name-master","activeClients":[],"queue":[],"shuffleMode":false}}')).called(1);
        });
      });

      group('When master', () {
        test('should throw an error', () {
          var controller = mockControllerAsMaster();

          expect(() => controller.playSong(871), throwsException);
        });
      });
    });
  });
}

class MockWebSocketSink extends Mock implements WebSocketSink {}

class MockChannel extends Mock implements IOWebSocketChannel {
  final WebSocketSink sink;
  MockChannel({
    this.sink,
  });
}

Controller mockControllerAsMaster() {
  Controller controllerAsMaster = Controller();
  controllerAsMaster.uniqueName.value = 'my-client-name-master';
  controllerAsMaster.player.value.master = 'my-client-name-master';

  controllerAsMaster.socket.channel = MockChannel(sink: MockWebSocketSink());

  return controllerAsMaster;
}

Controller mockControllerAsSlave() {
  Controller controllerAsSlave = Controller();
  controllerAsSlave.uniqueName.value = 'my-client-name-slave';
  controllerAsSlave.player.value.master = 'other-client-name-master';

  controllerAsSlave.socket.channel = MockChannel(sink: MockWebSocketSink());

  return controllerAsSlave;
}
