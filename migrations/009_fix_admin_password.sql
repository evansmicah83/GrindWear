-- Fix the seeded admin password hash so the DB-backed fallback login accepts admin123.
UPDATE users
SET password_hash = '$2b$12$8MQ0ClBfaXoeTlePG3JhS.5JEz7Mb8.DYUTIIEU9DqNeYq5wF8.Va',
    role = 'admin'
WHERE email = 'admin@grindbyte.com';
