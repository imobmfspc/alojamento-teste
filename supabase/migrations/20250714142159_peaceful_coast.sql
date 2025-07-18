/*
  # Add external link fields to propriedade table

  1. New Fields
    - `link_externo_url` (text) - URL for the external link
    - `link_externo_texto` (text) - Display text for the external link
  
  2. Changes
    - Add two new optional fields to store external link information
    - These fields will be used in the footer section
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propriedade' AND column_name = 'link_externo_url'
  ) THEN
    ALTER TABLE propriedade ADD COLUMN link_externo_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propriedade' AND column_name = 'link_externo_texto'
  ) THEN
    ALTER TABLE propriedade ADD COLUMN link_externo_texto text;
  END IF;
END $$;