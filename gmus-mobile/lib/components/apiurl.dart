import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controller.dart';
import '../socket.dart' as socket;

class _SetApiUrl extends StatefulWidget {
  @override
  _SetApiUrlState createState() => _SetApiUrlState();
}

class _SetApiUrlState extends State<_SetApiUrl> {
  String apiUrl;
  Controller controller = Get.find();

  @override
  Widget build(BuildContext context) {
    if (controller == null) {
      return null;
    }
    return Dialog(child: Column(
      children: <Widget>[
        Text('Current value: ${controller.apiUrl}'),
        TextField(
          onChanged: (newValue) {
            this.apiUrl = newValue;
          },
          decoration: InputDecoration(
              border: InputBorder.none,
              hintText: 'Set API URL',
            ),
        ),
        TextButton(
          child: Text('Set'),
          onPressed: () {
            socket.setApiUrl(controller, this.apiUrl);
            Navigator.pop(context);
          },
        ),
      ],
    ));
  }
}

Widget widgetBuilderSetApiUrl(BuildContext context) {
  return _SetApiUrl();
}
