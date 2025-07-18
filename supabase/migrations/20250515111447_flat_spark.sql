/*
  # Add storage bucket for room images
  
  1. Changes
    - Create storage bucket for room images
    - Add storage policies for authenticated users
*/

-- Enable storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Create policies for the images bucket
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'quartos'
);

CREATE POLICY "Allow authenticated users to update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'quartos'
);

CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'quartos'
);

CREATE POLICY "Allow public access to room images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');