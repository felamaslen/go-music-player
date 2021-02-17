import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class CenterSpinner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        child: CircularProgressIndicator(),
        height: 64,
        width: 64,
      ),
    );
  }
}
