import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controller.dart';

import './identify.dart';
import './ui.dart';

class Content extends StatelessWidget {
  final Controller controller = Get.find();
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      var loggedIn = controller.uniqueName.value.length > 0;
      if (!loggedIn) {
        return Identify();
      }

      return UI();
    });
  }
}
