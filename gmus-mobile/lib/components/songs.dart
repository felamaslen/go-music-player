import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;

import '../config.dart';
import '../types/song.dart';

import './spinner.dart';

class Songs extends StatefulWidget {
  final String artist;
  final String album;
  final void Function(int) onSelect;

  Songs({
    @required this.artist, // can be an empty string
    @required this.album, // can be an empty string
    @required this.onSelect,
  });

  @override
  _SongsWidgetState createState() => _SongsWidgetState(
      artist: this.artist,
      album: this.album,
      onSelect: this.onSelect,
    );
}

Future<List<Song>> fetchSongs(String artist) async {
  final response = await http.get(Uri.https(config['apiUrl'], '/songs', {
    'artist': artist,
  }));

  if (response.statusCode != 200) {
    throw Exception('Failed to load songs');
  }

  List<Song> songs = [];
  var responseJson = jsonDecode(response.body)['songs'];
  for (var i = 0; i < responseJson.length; i++) {
    songs.add(Song.fromJson(responseJson[i]));
  }
  return songs;
}

class _SongsWidgetState extends State<Songs> {
  final String artist;
  final String album;
  Future<List<Song>> songs;

  final void Function(int) onSelect;

  _SongsWidgetState({
    @required this.artist,
    @required this.album,
    @required this.onSelect,
  });

  @override
  void initState() {
    super.initState();
    songs = fetchSongs(this.artist);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Song>>(
      future: songs,
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          var filteredAlbums = this.album == null
            ? snapshot.data
            : snapshot.data.where((song) => song.album == this.album);

          return ListView(
            padding: EdgeInsets.only(left: 8, right: 8),
            children: filteredAlbums.map<Widget>((song) => Container(
              height: 40,
              color: Colors.white,
              child: Align(
                alignment: Alignment.centerLeft,
                child: TextButton(
                  child: Text("${song.track} - ${song.title.length == 0 ? 'Untitled Track' : song.title}"),
                  onPressed: () {
                    onSelect(song.id);
                  },
                  style: TextButton.styleFrom(
                    textStyle: TextStyle(fontSize: 18, fontStyle: FontStyle.normal),
                    primary: Colors.black,
                  ),
                ),
              ),
            )).toList(),
          );
        }
        if (snapshot.hasError) {
          return Text("${snapshot.error}");
        }

        return CenterSpinner();
      },
    );
  }
}
