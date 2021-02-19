import '../config.dart';

Uri formattedUrl(String path, [Map<String, dynamic> query]) {
  String apiUrl = config['apiUrl'];

  if (apiUrl.indexOf('/') == -1) {
    return Uri.https(apiUrl, path);
  }

  String host = apiUrl.substring(0, apiUrl.indexOf('/'));
  String pathPrefix = apiUrl.substring(apiUrl.indexOf('/'));

  return Uri.https(host, "$pathPrefix$path", query);
}
