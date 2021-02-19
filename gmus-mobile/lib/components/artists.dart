import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../utils/url.dart';

import './spinner.dart';

class Artists extends StatefulWidget {
  final String apiUrl;
  final void Function(String) onSelect;

  Artists({
    @required this.apiUrl,
    @required this.onSelect,
  });

  @override
  _ArtistsWidgetState createState() => _ArtistsWidgetState(apiUrl: this.apiUrl, onSelect: this.onSelect);
}

Future<List<String>> fetchArtists(String apiUrl) async {

  final response = await http.get(formattedUrl(apiUrl, '/artists'));

  if (response.statusCode == 200) {
    return List<String>.from(jsonDecode(response.body)['artists']);
  } else {
    throw Exception('Failed to load artists');
  }
}

class _ArtistsWidgetState extends State<Artists> {
  String apiUrl;
  Future<List<String>> artists;

  final void Function(String) onSelect;

  _ArtistsWidgetState({
    @required this.apiUrl,
    @required this.onSelect,
  });

  @override
  void initState() {
    super.initState();
    artists = fetchArtists(this.apiUrl);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<String>>(
      future: artists,
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return ListView(
            padding: EdgeInsets.only(left: 8, right: 8),
            children: snapshot.data.map((artist) => InkWell(
              onTap: () {
                onSelect(artist);
              },
              child: SizedBox(
                height: 40,
                width: MediaQuery.of(context).size.width,
                child: Container(
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      artist.length == 0 ? 'Unknown artist' : artist,
                      style: TextStyle(
                        fontSize: 18,
                      ),
                    ),
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
