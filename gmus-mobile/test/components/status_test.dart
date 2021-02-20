import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';

import 'package:gmus/components/status.dart';
import 'package:gmus/controller.dart';

class TestStatusBar extends StatelessWidget {
  final Controller controller;
  TestStatusBar({
    @required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    Get.put(this.controller);

    return Directionality(
      textDirection: TextDirection.ltr,
      child: StatusBarWrapped(controller: this.controller),
    );
  }
}

void main() {
  testWidgets('Status bar should render a disconnected message', (WidgetTester tester) async {
    await tester.pumpWidget(TestStatusBar(controller: Controller()));

    expect(find.text('Disconnected'), findsOneWidget);
  });

  testWidgets('Status bar should render a connected message with name', (WidgetTester tester) async {
    Controller controller = Controller();
    controller.uniqueName = 'mob-DvaU1'.obs;
    controller.socket.connected.value = true;

    await tester.pumpWidget(TestStatusBar(controller: controller));

    expect(find.textContaining('Connected'), findsOneWidget);
    expect(find.textContaining('mob-DvaU1'), findsOneWidget);
  });
}
