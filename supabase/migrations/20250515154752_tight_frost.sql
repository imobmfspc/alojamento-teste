/*
  # Remove storage bucket for room images since we're using Cloudinary
  
  1. Changes
    - Remove storage bucket and policies for room images
*/

-- Drop storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to room images" ON storage.objects;

-- Remove storage bucket
DELETE FROM storage.buckets WHERE id = 'images';