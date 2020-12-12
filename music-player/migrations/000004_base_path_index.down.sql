DROP INDEX songs_file_time_unique;
CREATE INDEX filename_timestamp ON songs (base_path, relative_path, modified_date);
