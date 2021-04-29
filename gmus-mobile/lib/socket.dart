import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:get/get.dart';
import 'package:nanoid/nanoid.dart';
import 'package:web_socket_channel/io.dart';

import './actions.dart' as actions;
import './controller.dart';

String getWebSocketUrl(String apiUrl) {
  return "wss://$apiUrl/pubsub";
}

String getUniqueName(String name) {
  return "$name-${nanoid(5)}";
}

const socketKeepaliveTimeoutMs = 30000;

class Socket {
  WebSocket conn;
  IOWebSocketChannel channel;

  RxBool connected = false.obs;
  RxString error = ''.obs;

  void _keepalive() {
    var future = new Future.delayed(const Duration(milliseconds: socketKeepaliveTimeoutMs));
    void ping(dynamic data) {
      channel.sink.add(jsonEncode({'type': 'PING'}));
      _keepalive();
    }
    var subscription = future.asStream().listen(ping);

    channel.sink.done.whenComplete(() {
      subscription.cancel();
    });
  }

  Future<String> connect(
    String apiUrl,
    String name,
    void Function(String) onRemoteMessage,
  ) async {
    if (apiUrl == null || name == null || apiUrl.length == 0 || name.length == 0) {
      return null;
    }

    final String uniqueName = getUniqueName(name);

    final String webSocketUrl = getWebSocketUrl(apiUrl);
    final String pubsubUrl = "$webSocketUrl?client-name=$uniqueName";

    connected.value = false;

    try {
      conn = await WebSocket
        .connect(Uri.parse(pubsubUrl).toString())
        .timeout(Duration(seconds: 10));

      channel = IOWebSocketChannel(conn);

      channel.stream.listen((message) => onRemoteMessage(message));

      connected.value = true;
      error.value = '';

      _keepalive();
    }
    on SocketException {
      error.value = "Error connecting to socket";
    }
    on TimeoutException {
      error.value = "Timeout connecting to socket";
    }
    catch (err) {
      error.value = "Unknown error connecting to socket";
    }

    return uniqueName;
  }

  void disconnect() {
    conn?.close();
  }

  void dispatch(String action) {
    if (channel == null) {
      return;
    }
    channel.sink.add(action);
  }
}

void onRemoteMessage(Controller controller, String message) {
  var action = jsonDecode(message);
  switch (action['type']) {
    case actions.CLIENT_LIST_UPDATED:
      var payload = action['payload'];

      List<Client> clientList = [];
      for (var i = 0; i < payload.length; i++) {
        clientList.add(new Client(
          payload[i]['name'],
          payload[i]['lastPing'],
        ));
      }

      controller.setClients(clientList);

      break;

    case actions.STATE_SET:
      Player nextPlayer = new Player();

      nextPlayer.currentTime = action['payload']['currentTime'].toDouble();
      nextPlayer.seekTime = action['payload']['seekTime'].toDouble();
      nextPlayer.master = action['payload']['master'];
      nextPlayer.songId = action['payload']['songId'];
      nextPlayer.playing = action['payload']['playing'];
      nextPlayer.shuffleMode = action['payload']['shuffleMode'];

      nextPlayer.queue = [];
      for (var i = 0; i < action['payload']['queue'].length; i++) {
        nextPlayer.queue.add(action['payload']['queue'][i]);
      }

      nextPlayer.activeClients = [];
      for (var i = 0; i < action['payload']['activeClients'].length; i++) {
        nextPlayer.activeClients.add(action['payload']['activeClients'][i]);
      }

      controller.player.value = nextPlayer;

      break;
  }
}
