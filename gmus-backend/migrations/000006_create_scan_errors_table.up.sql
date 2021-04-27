CREATE TABLE scan_errors (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  base_path VARCHAR NOT NULL,
  relative_path VARCHAR NOT NULL,
  error VARCHAR NOT NULL
);

CREATE INDEX scan_errors_base_path ON scan_errors (base_path);
CREATE INDEX scan_errors_relative_path ON scan_errors (relative_path);
