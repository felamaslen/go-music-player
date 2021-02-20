import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controller.dart';

class Identify extends StatelessWidget {
  final Controller controller = Get.find();
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text("Current name: ${controller.name.value}"),
        TextField(
            onChanged: controller.setName,
            decoration: InputDecoration(
                border: InputBorder.none,
                hintText: 'Set name',
              ),
        ),
        TextButton(
            child: Text('Connect'),
            onPressed: () {
              controller.connect();
            },
        ),
      ],
    );
  }
}
