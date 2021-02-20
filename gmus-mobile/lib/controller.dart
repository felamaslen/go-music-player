import 'dart:convert';
import 'dart:io';

import 'package:get/get.dart';

import './actions.dart' as actions;
import './preferences.dart' as Preferences;
import './socket.dart';

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

  RxString name = ''.obs;
  RxString uniqueName = ''.obs;

  Rx<Player> player = new Player().obs;
  RxList<Client> clients = <Client>[].obs;

  final Socket socket = Socket();

  Controller({
    this.apiUrl,
    this.name,
  });

  Future<void> connect() async {
    uniqueName.value = await socket.connect(
      apiUrl.value,
      name.value,
      (message) => onRemoteMessage(this, message),
    );
  }

  void disconnect() {
    socket.disconnect();
    uniqueName.value = '';
  }

  setApiUrl(String apiUrl) {
    this.disconnect();
    this.apiUrl = apiUrl.obs;
    this.connect();
    Preferences.setApiUrl(apiUrl);
  }

  setName(String newName) {
    name.value = newName;
    Preferences.setClientName(newName);
  }

  setClients(List<Client> newClients) {
    this.clients.assignAll(newClients);
  }

  bool _isMaster() => this.uniqueName.value == this.player.value.master;

  void playPause() {
    this.player.value.playing = !this.player.value.playing;

    if (!this._isMaster()) {
      this.socket.dispatch(jsonEncode({
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

    this.socket.dispatch(jsonEncode({
      'type': actions.STATE_SET,
      'payload': this.player.value.stringify(),
    }));
  }
}
