import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;

import '../types/song.dart';
import '../utils/url.dart';

import './spinner.dart';

Future<List<Song>> fetchSongs(String apiUrl, String artist) async {
  final response = await http.get(formattedUrl(apiUrl, '/songs', {
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

class Songs extends StatelessWidget {
  final String artist;
  final String album;
  final Future<List<Song>> songs;
  final void Function(int) onSelect;

  Songs({
    @required this.artist, // can be an empty string
    @required this.album, // can be an empty string
    @required this.songs,
    @required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    if (artist == null || songs == null) {
      return Container();
    }
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
