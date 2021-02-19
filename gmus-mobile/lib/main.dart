import 'dart:io';

import 'package:flutter_dotenv/flutter_dotenv.dart' as DotEnv;
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import './config.dart';
import './controller.dart';

import './components/content.dart';
import './components/status.dart';

class Gmus extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    Get.put(Controller());

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

  runApp(GetMaterialApp(home: Gmus()));
}
