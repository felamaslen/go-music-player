import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';

class Preferences {
  final String apiUrl;
  final String clientName;

  Preferences({
    @required this.apiUrl,
    @required this.clientName,
  });
}

Future<Preferences> getPreferences() async {
  SharedPreferences preferences = await SharedPreferences.getInstance();
  return Preferences(
    apiUrl: preferences.get('apiUrl'),
    clientName: preferences.get('clientName'),
  );
}

setApiUrl(String apiUrl) async {
  SharedPreferences preferences = await SharedPreferences.getInstance();
  print('setting preferences apiUrl=$apiUrl');
  await preferences.setString('apiUrl', apiUrl);
}

setClientName(String clientName) async {
  SharedPreferences preferences = await SharedPreferences.getInstance();
  await preferences.setString('clientName', clientName);
}
