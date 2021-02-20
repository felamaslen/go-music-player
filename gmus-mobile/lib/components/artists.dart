import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../utils/url.dart';

import './spinner.dart';

Future<List<String>> fetchArtists(String apiUrl) async {
  final response = await http.get(formattedUrl(apiUrl, '/artists'));

  if (response.statusCode == 200) {
    return List<String>.from(jsonDecode(response.body)['artists']);
  } else {
    throw Exception('Failed to load artists');
  }
}

class Artist extends StatelessWidget {
  final String artist;
  final void Function(String) onSelect;
  Artist({
    @required this.artist,
    @required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
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
    );
  }
}
