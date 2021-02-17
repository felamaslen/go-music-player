import 'package:flutter_dotenv/flutter_dotenv.dart';

final config = {
  'isDevelopment': env['DART_ENV'] == 'development',
  'apiUrl': env['API_URL'] ?? 'http://localhost:3000',
};
