import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;

import '../utils/url.dart';

import './spinner.dart';

Future<List<String>> fetchAlbums(String apiUrl, String artist) async {
  final response = await http.get(formattedUrl(apiUrl, '/albums', {
    'artist': artist,
  }));

  if (response.statusCode == 200) {
    return List<String>.from(jsonDecode(response.body)['albums']);
  } else {
    throw Exception('Failed to load albums');
  }
}

const allAlbums = 'All albums';

class Albums extends StatelessWidget {
  final String artist;
  final Future<List<String>> albums;
  final void Function(String, String) onSelect;

  Albums({
    @required this.artist,
    @required this.albums,
    @required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    if (artist == null || albums == null) {
      return Container();
    }
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
