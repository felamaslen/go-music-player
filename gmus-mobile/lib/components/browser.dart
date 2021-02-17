import 'package:flutter/widgets.dart';
import 'package:get/get.dart';

import '../controller.dart';

import './albums.dart';
import './artists.dart';
import './songs.dart';

class Browser extends StatefulWidget {
  @override
  _BrowserWidgetState createState() => _BrowserWidgetState();
}

class _BrowserWidgetState extends State<Browser> {
  final Controller controller = Get.find();

  PageController pageController = PageController();

  void _jumpToPage(int page) {
    pageController.animateToPage(page, duration: Duration(milliseconds: 500), curve: Curves.ease);
  }
  void _jumpToAlbums() {
    this._jumpToPage(1);
  }
  void _jumpToSongs() {
    this._jumpToPage(2);
  }

  RxString selectedArtist;
  RxString selectedAlbum;

  void onSelectArtist(String artist) {
    this.selectedArtist = artist.obs;
    this._jumpToAlbums();
  }

  void onSelectAlbum(String artist, String album) {
    this.selectedAlbum = album.obs;
    this._jumpToSongs();
  }

  void onSelectSong(int songId) {
    controller.playSong(songId);
  }

  @override
  Widget build(BuildContext context) {
    return PageView(
      controller: pageController,
      children: <Widget>[
        Artists(onSelect: this.onSelectArtist),
        Obx(() => Albums(artist: this.selectedArtist.value, onSelect: this.onSelectAlbum)),
        Obx(() => Songs(
          artist: this.selectedArtist.value,
          album: this.selectedAlbum.value,
          onSelect: this.onSelectSong,
        )),
      ],
      pageSnapping: true,
    );
  }
}
