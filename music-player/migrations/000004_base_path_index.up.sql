DROP INDEX filename_timestamp;
CREATE UNIQUE INDEX songs_file_time_unique ON songs (base_path, relative_path, modified_date)
