import 'package:flutter/widgets.dart';

class DoubleHolder {
  double value = 0.0;
}

class StatefulListView extends StatefulWidget {
  final DoubleHolder offset = new DoubleHolder();
  final int _itemCount;
  final IndexedWidgetBuilder _indexedWidgetBuilder;

  StatefulListView(
    this._itemCount,
    this._indexedWidgetBuilder,
    { Key key }
  ): super(key: key);

  double getOffsetMethod() => offset.value;

  void setOffsetMethod(double val) {
    offset.value = val;
  }

  @override
  _StatefulListViewState createState() => new _StatefulListViewState(_itemCount, _indexedWidgetBuilder);
}

class _StatefulListViewState extends State<StatefulListView> {
  ScrollController scrollController;

  final int _itemCount;
  final IndexedWidgetBuilder _itemBuilder;

  _StatefulListViewState(this._itemCount, this._itemBuilder);

  @override
  void initState() {
    super.initState();
    scrollController = new ScrollController(initialScrollOffset: widget.getOffsetMethod());
  }

  @override
  Widget build(BuildContext context) {
    return new NotificationListener(
      child: new ListView.builder(
        controller: scrollController,
        itemCount: _itemCount,
        itemBuilder: _itemBuilder,
      ),
      onNotification: (notification) {
        if (notification is ScrollNotification) {
          widget.setOffsetMethod(notification.metrics.pixels);
        }
        return;
      },
    );
  }
}
