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
    return Obx(() {
      var uniqueName = controller.uniqueName.value;
      if (uniqueName.length == 0) {
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
