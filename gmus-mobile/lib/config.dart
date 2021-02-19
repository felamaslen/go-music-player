import 'package:flutter_dotenv/flutter_dotenv.dart';

final config = {
  'isDevelopment': env['DART_ENV'] == 'development',
};
