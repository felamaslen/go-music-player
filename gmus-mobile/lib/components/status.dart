import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controller.dart';

class StatusBarWrapped extends StatelessWidget {
  final Controller controller;
  StatusBarWrapped({
    @required this.controller,
  });
  @override
  Widget build(BuildContext context) {
    if (controller == null) {
      return null;
    }
    return Obx(() {
      var connected = controller.connected.value;
      if (!connected) {
        return Text("Disconnected");
      }

      return Center(
        child: Text("Connected | ${controller.uniqueName}"),
      );
    });
  }
}

class StatusBar extends StatelessWidget {
  final Controller controller = Get.find();
  @override
  Widget build(BuildContext context) {
    return StatusBarWrapped(controller: this.controller);
  }
}
