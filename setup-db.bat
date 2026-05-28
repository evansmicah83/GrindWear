@echo off
SET PSQL="C:\laragon\bin\postgresql\postgresql\bin\psql.exe"
SET PGPASSWORD=

echo [1/3] Creating database grind_byte...
%PSQL% -U postgres -c "CREATE DATABASE grind_byte;" 2>nul
if %errorlevel% neq 0 (
  echo Database may already exist, continuing...
)

echo [2/3] Running schema migration...
%PSQL% -U postgres -d grind_byte -f migrations\001_initial_schema.sql
if %errorlevel% neq 0 (
  echo Migration failed. Check errors above.
  pause
  exit /b 1
)

echo [3/4] Seeding categories and products...
%PSQL% -U postgres -d grind_byte -f migrations\002_seed.sql
if %errorlevel% neq 0 (
  echo Seed failed. Check errors above.
  pause
  exit /b 1
)

echo [4/4] Running settings migration...
%PSQL% -U postgres -d grind_byte -f migrations\003_settings.sql
if %errorlevel% neq 0 (
  echo Settings migration failed. Check errors above.
  pause
  exit /b 1
)

echo.
echo Done! Database is ready.
echo Now run: cd server ^&^& npm run dev
pause
