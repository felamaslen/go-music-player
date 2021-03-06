import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:gmus/components/spinner.dart';

import '../controller.dart';

import './identify.dart';
import './ui.dart';

class Content extends StatelessWidget {
  final Controller controller = Get.find();
  @override
  Widget build(BuildContext context) {
    if (controller == null) {
      return null;
    }
    return Obx(() {
      var loggedIn = controller.uniqueName.value.length > 0;
      if (!loggedIn) {
        return Identify();
      }
      if (controller.socket.error.value.length != 0) {
        return Center(child: Text(controller.socket.error.value));
      }
      if (!controller.socket.connected.value) {
        return CenterSpinner();
      }

      return UI();
    });
  }
}
