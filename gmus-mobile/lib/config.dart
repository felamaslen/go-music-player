import 'package:flutter_dotenv/flutter_dotenv.dart';

const apiUrl = String.fromEnvironment('API_URL') ?? 'localhost:3000';

final config = {
  'isDevelopment': env['DART_ENV'] == 'development',
  'apiUrl': env['API_URL'] ?? apiUrl,
};
