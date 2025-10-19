-- Database initialization script for Docker
-- This will create the database and sample data for all team members

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure the user exists and has proper permissions
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'rental_user') THEN

      CREATE ROLE rental_user LOGIN PASSWORD 'rental_password';
   END IF;
END
$do$;

-- Grant all privileges to rental_user on the database
GRANT ALL PRIVILEGES ON DATABASE rental_db TO rental_user;
ALTER USER rental_user CREATEDB;

-- The TypeORM will handle table creation automatically
