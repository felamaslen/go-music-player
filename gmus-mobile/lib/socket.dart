import 'dart:convert';

import 'package:nanoid/nanoid.dart';
import 'package:web_socket_channel/io.dart';

import './config.dart';
import './controller.dart';

String getWebSocketUrl() {
  return "wss://${config['apiUrl']}/pubsub";
}

String getUniqueName(String name) {
  return "$name-${nanoid(5)}";
}

const socketKeepaliveTimeoutMs = 20000;

Future keepalive(IOWebSocketChannel channel) {
  return new Future.delayed(const Duration(milliseconds: socketKeepaliveTimeoutMs), () {
    channel.sink.add(jsonEncode({'type': 'PING'}));

    keepalive(channel);
  });
}

void connect(Controller controller) async {
  if (controller.name.value.length == 0) {
    return;
  }

  final String uniqueName = getUniqueName(controller.name.value);
  controller.setUniqueName(uniqueName);

  final String webSocketUrl = getWebSocketUrl();
  final String pubsubUrl = "$webSocketUrl?client-name=$uniqueName";

  var channel = IOWebSocketChannel.connect(Uri.parse(pubsubUrl));
  controller.channel = channel;

  channel.stream.listen((message) {
    controller.onRemoteMessage(message);
  });

  keepalive(channel);
}
