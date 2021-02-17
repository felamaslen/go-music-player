import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controller.dart';

import './browser.dart';
import './player.dart';

// Main UI once identified
class UI extends StatelessWidget {
  final Controller controller = Get.find();
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(child: Browser()),
        GmusPlayer(),
      ],
    );
  }
}
