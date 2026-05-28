-- Replace dead Unsplash image URLs with working ones
UPDATE product_images SET url = 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800'
WHERE url = 'https://images.unsplash.com/photo-1620799140188-3b2a7c2fb7e5?w=800';
