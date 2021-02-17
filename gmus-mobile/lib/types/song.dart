class Song {
  int id;
  int track;
  String title;
  String artist;
  String album;
  int time;

  Song({this.id, this.track, this.title, this.artist, this.album, this.time});

  factory Song.fromJson(Map<String, dynamic> json) {
    return Song(
        id: json['id'],
        track: json['track'],
        title: json['title'],
        artist: json['artist'],
        album: json['album'],
        time: json['time'],
      );
  }
}
