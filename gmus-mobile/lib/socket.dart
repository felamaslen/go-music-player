import 'dart:async';
import 'dart:convert';

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

void keepalive(IOWebSocketChannel channel) {
  var future = new Future.delayed(const Duration(milliseconds: socketKeepaliveTimeoutMs));
  void ping(dynamic data) {
    channel.sink.add(jsonEncode({'type': 'PING'}));
    keepalive(channel);
  }
  var subscription = future.asStream().listen(ping);

  channel.sink.done.whenComplete(() {
    subscription.cancel();
  });
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

      nextPlayer.queue = [];
      for (var i = 0; i < action['payload']['queue'].length; i++) {
        nextPlayer.queue.add(action['payload']['queue'][i]);
      }

      controller.player.value = nextPlayer;

      break;
  }
}

void connect(Controller controller) {
  if (controller == null ||
      controller.name.value.length == 0 ||
      controller.apiUrl.value.length == 0) {
    return;
  }

  final String uniqueName = getUniqueName(controller.name.value);
  controller.uniqueName.value = uniqueName;

  final String webSocketUrl = getWebSocketUrl(controller.apiUrl.value);
  final String pubsubUrl = "$webSocketUrl?client-name=$uniqueName";

  var channel = IOWebSocketChannel.connect(Uri.parse(pubsubUrl));
  controller.channel = channel;

  channel.stream.listen((message) {
    onRemoteMessage(controller, message);
  });

  controller.connected.value = true;

  keepalive(channel);
}

void disconnect(Controller controller) {
  controller.connected.value = false;
  if (controller.channel != null) {
    controller.channel.sink.close();
  }
  controller.uniqueName.value = '';
}

void setApiUrl(Controller controller, String apiUrl) {
  disconnect(controller);
  controller.setApiUrl(apiUrl);
  connect(controller);
}
