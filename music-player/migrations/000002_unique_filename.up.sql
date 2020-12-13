ALTER TABLE songs
ADD CONSTRAINT songs_filename_unique UNIQUE (base_path, relative_path);
