import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controller.dart';

class GmusPlayer extends StatelessWidget {
  final Controller controller = Get.find();
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      bool isPlaying = controller.player.value.playing;

      String playPauseButtonText = isPlaying ? 'Pause' : 'Play';

      return Row(
        children: [
          TextButton(
              child: Text(playPauseButtonText),
              onPressed: controller.playPause,
          ),
        ],
      );
    });
  }
}

