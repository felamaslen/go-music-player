import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import 'package:gmus/components/spinner.dart';
import 'package:gmus/components/statefullist.dart';
import 'package:gmus/types/song.dart';

import '../controller.dart';

import './albums.dart';
import './artists.dart';
import './songs.dart';

class Browser extends StatefulWidget {
  @override
  _BrowserWidgetState createState() => _BrowserWidgetState();
}

class _BrowserWidgetState extends State<Browser> with SingleTickerProviderStateMixin {
  final Controller controller = Get.find();

  PageController _pageController;
  Widget _artistList;
  RxBool _artistsLoading = false.obs;

  RxList<String> _artists = <String>[].obs;
  Rx<Future<List<String>>> _albums = Future.value(<String>[]).obs;
  Rx<Future<List<Song>>> _songs = Future.value(<Song>[]).obs;

  void _jumpToPage(int page) {
    _pageController.animateToPage(page, duration: Duration(milliseconds: 500), curve: Curves.ease);
  }
  void _jumpToAlbums() {
    this._jumpToPage(1);
  }
  void _jumpToSongs() {
    this._jumpToPage(2);
  }

  RxString selectedArtist;
  RxString selectedAlbum;

  void _onSelectArtist(String artist) {
    this.selectedArtist = artist.obs;
    _albums.value = fetchAlbums(controller.apiUrl.value, this.selectedArtist.value);
    this._jumpToAlbums();
  }

  void _onSelectAlbum(String artist, String album) {
    this.selectedAlbum = album.obs;
    _songs.value = fetchSongs(controller.apiUrl.value, this.selectedArtist.value);
    this._jumpToSongs();
  }

  void _onSelectSong(int songId) {
    controller.playSong(songId);
  }

  Future<void> _loadArtists() async {
    _artistsLoading.value = true;
    _artists.assignAll(await fetchArtists(controller.apiUrl.value));
    _artistsLoading.value = false;
  }

  @override
  void initState() {
    super.initState();
    _pageController = new PageController();
    _loadArtists();
  }

  @override
  void dispose() {
    super.dispose();
    _pageController.dispose();
  }

  Widget _buildArtist(BuildContext context, int index) {
    return Artist(artist: _artists[index], onSelect: _onSelectArtist);
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (_artistsLoading.isTrue) {
        return CenterSpinner();
      }
      if (_artistList == null) {
        _artistList = new StatefulListView(_artists.length, _buildArtist);
      }
      return PageView(
        controller: _pageController,
        children: <Widget>[
          _artistList,
          Obx(() => Albums(
            artist: this.selectedArtist?.value,
            albums: this._albums.value,
            onSelect: this._onSelectAlbum,
          )),
          Obx(() => Songs(
            artist: this.selectedArtist?.value,
            album: this.selectedAlbum?.value,
            songs: this._songs.value,
            onSelect: this._onSelectSong,
          )),
        ],
        pageSnapping: true,
      );
    });
  }
}
