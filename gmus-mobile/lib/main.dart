import 'dart:io';

import 'package:flutter_dotenv/flutter_dotenv.dart' as DotEnv;
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:gmus/components/apiurl.dart';

import './config.dart';
import './controller.dart';
import './preferences.dart';

import './components/content.dart';
import './components/status.dart';

class Gmus extends StatelessWidget {
  final Preferences storedPreferences;
  Gmus({
    @required this.storedPreferences,
  });

  @override
  Widget build(BuildContext context) {
    Get.put(Controller(
      apiUrl: this.storedPreferences.apiUrl.obs,
      name: this.storedPreferences.clientName.obs,
    ));

    return Scaffold(
      appBar: AppBar(
          title: Text('gmus'),
        ),
      body: Container(
          child: Column(
              children: [
                Expanded(
                  child: Content(),
                ),
                StatusBar(),
              ],
          ),
        ),
      drawer: Drawer(
          child: ListView(
            padding: EdgeInsets.only(top: 40.0),
            children: <Widget>[
              ListTile(
                title: Text('Set API URL'),
                onTap: () {
                  showDialog(
                    context: context,
                    builder: widgetBuilderSetApiUrl,
                  );
                },
              ),
            ],
          ),
        ),
      );
  }
}

class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext context) {
    return super.createHttpClient(context)
        ..badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
  }
}

Future<void> main() async {
  await DotEnv.load();

  if (config['isDevelopment']) {
    HttpOverrides.global = new MyHttpOverrides();
  }

  getPreferences().then((preferences) =>
      runApp(GetMaterialApp(home: Gmus(storedPreferences: preferences))));
}
