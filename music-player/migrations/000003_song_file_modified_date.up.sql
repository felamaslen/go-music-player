ALTER TABLE songs ADD modified_date bigint;
UPDATE songs SET modified_date = 0;
ALTER TABLE songs ALTER COLUMN modified_date SET NOT NULL;

CREATE UNIQUE INDEX songs_file_time_unique ON songs (base_path, relative_path, modified_date)
