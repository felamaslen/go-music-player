import 'dart:convert';

import 'package:get/get.dart';
import 'package:web_socket_channel/io.dart';

import './actions.dart' as actions;
import './preferences.dart' as Preferences;

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
  RxString apiUrl = ''.obs;
  RxBool connected = false.obs;

  RxString name = ''.obs;
  RxString uniqueName = ''.obs;

  IOWebSocketChannel channel;

  Rx<Player> player = new Player().obs;
  RxList<Client> clients = <Client>[].obs;

  Controller({
    this.apiUrl,
    this.name,
  });

  setApiUrl(String apiUrl) {
    this.apiUrl = apiUrl.obs;
    Preferences.setApiUrl(apiUrl);
  }

  setName(String newName) {
    name.value = newName;
    Preferences.setClientName(newName);
  }

  setClients(List<Client> newClients) {
    this.clients.assignAll(newClients);
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
