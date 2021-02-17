import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;

import '../config.dart';

import './spinner.dart';

class Albums extends StatefulWidget {
  final String artist;
  final void Function(String, String) onSelect;

  Albums({
    @required this.artist,
    @required this.onSelect,
  });

  @override
  _AlbumsWidgetState createState() => _AlbumsWidgetState(artist: this.artist, onSelect: this.onSelect);
}

Future<List<String>> fetchAlbums(String artist) async {
  final response = await http.get(Uri.https(config['apiUrl'], '/albums', {
    'artist': artist,
  }));

  if (response.statusCode == 200) {
    return List<String>.from(jsonDecode(response.body)['albums']);
  } else {
    throw Exception('Failed to load albums');
  }
}

const allAlbums = 'All albums';

class _AlbumsWidgetState extends State<Albums> {
  final String artist;
  Future<List<String>> albums;

  final void Function(String, String) onSelect;

  _AlbumsWidgetState({
    @required this.artist,
    @required this.onSelect,
  });

  @override
  void initState() {
    super.initState();
    albums = fetchAlbums(this.artist);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<String>>(
      future: albums,
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          List<String> albumsWithAll = snapshot.data.sublist(0);
          albumsWithAll.insert(0, allAlbums);
          
          return ListView(
            padding: EdgeInsets.only(left: 8, right: 8),
            children: albumsWithAll.map((album) => Container(
              height: 40,
              color: Colors.white,
              child: Align(
                alignment: Alignment.centerLeft,
                child: TextButton(
                  child: Text(album.length == 0 ? 'Unknown album' : album),
                  onPressed: () {
                    onSelect(artist, album == allAlbums ? null : album);
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
