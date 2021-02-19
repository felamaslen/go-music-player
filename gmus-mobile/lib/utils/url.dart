Uri formattedUrl(String apiUrl, String path, [Map<String, dynamic> query]) {
  if (apiUrl.indexOf('/') == -1) {
    return Uri.https(apiUrl, path, query);
  }

  String host = apiUrl.substring(0, apiUrl.indexOf('/'));
  String pathPrefix = apiUrl.substring(apiUrl.indexOf('/'));

  return Uri.https(host, "$pathPrefix$path", query);
}
