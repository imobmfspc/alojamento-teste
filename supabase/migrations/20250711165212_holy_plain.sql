/*
  # Add hero_image_url column to propriedade table

  1. Changes
    - Add `hero_image_url` column to `propriedade` table
    - Column type: TEXT (allows NULL values)
    - This column will store the URL of the hero/background image for the homepage

  2. Purpose
    - Enables the property management system to store and display a custom hero image
    - Supports the image upload functionality in the admin panel
    - Allows dynamic customization of the homepage background
*/

-- Add hero_image_url column to propriedade table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propriedade' AND column_name = 'hero_image_url'
  ) THEN
    ALTER TABLE public.propriedade ADD COLUMN hero_image_url TEXT NULL;
  END IF;
END $$;