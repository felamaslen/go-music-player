import 'package:flutter_test/flutter_test.dart';
import 'package:gmus/utils/url.dart';

void main() {
  test('formattedUrl should format a root URL', () {
    expect(
      formattedUrl('my.api.com', '/foo/bar').toString(),
      'https://my.api.com/foo/bar',
    );
  });

  test('formattedUrl should format a root URL with query', () {
    expect(
      formattedUrl('my.api.com', '/foo/bar', {
        'baz': 'yes',
      }).toString(),
      'https://my.api.com/foo/bar?baz=yes',
    );
  });

  test('formattedUrl should format a non-root URL', () {
    expect(
      formattedUrl('my.api.com/api', '/foo/bar').toString(),
      'https://my.api.com/api/foo/bar',
    );
  });

  test('formattedUrl should format a non-root URL with query', () {
    expect(
      formattedUrl('my.api.com/api', '/foo/bar', {
        'baz': 'yes',
      }).toString(),
      'https://my.api.com/api/foo/bar?baz=yes',
    );
  });
}
