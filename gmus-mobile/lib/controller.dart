import 'dart:convert';

import 'package:get/get.dart';
import 'package:web_socket_channel/io.dart';

import './actions.dart' as actions;

class Player {
  double currentTime = 0;
  double seekTime = -1;
  String master;
  int songId;
  bool playing = false;
  List<int> queue = [];

  Map<String, dynamic> stringify() {
    return {
      'currentTime': this.currentTime,
      'seekTime': this.seekTime,
      'master': this.master,
      'songId': this.songId,
      'playing': this.playing,
      'queue': this.queue,
    };
  }
}

class Client {
  String name;
  int lastPing;

  Client(String name, int lastPing) {
    this.name = name;
    this.lastPing = lastPing;
  }
}

class Controller extends GetxController {
  RxString name = ''.obs;
  RxString uniqueName = ''.obs;

  IOWebSocketChannel channel;

  Rx<Player> player = new Player().obs;
  RxList<Client> clients;

  setName(String newName) {
    name.value = newName;
  }
  setUniqueName(String newUniqueName) {
    uniqueName.value = newUniqueName;
  }

  onRemoteMessage(String message) {
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

        this.clients = clientList.obs;

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

        this.player.value = nextPlayer;

        break;
    }
  }

  void _remoteDispatch(String action) {
    if (this.channel == null) {
      return;
    }

    this.channel.sink.add(action);
  }

  bool _isMaster() => this.uniqueName.value == this.player.value.master;

  void playPause() {
    this.player.value.playing = !this.player.value.playing;

    if (!this._isMaster()) {
      this._remoteDispatch(jsonEncode({
        'type': actions.STATE_SET,
        'payload': this.player.value.stringify(),
      }));
    }
  }

  void playSong(int songId) {
    if (this._isMaster()) {
      throw Exception('Playing songs on mobile not yet implemented!');
    }

    this.player.value.songId = songId;
    this.player.value.currentTime = 0;
    this.player.value.seekTime = -1;
    this.player.value.playing = true;

    this._remoteDispatch(jsonEncode({
      'type': actions.STATE_SET,
      'payload': this.player.value.stringify(),
    }));
  }
}
