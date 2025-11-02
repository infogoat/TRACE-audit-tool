@echo off
echo Checking Node.js version...
node -v

echo Checking npm version...
npm -v

:: Check if pnpm is installed
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo pnpm not found, installing...
    npm install -g pnpm
) else (
    echo pnpm is already installed.
)

echo Installing project dependencies...
pnpm install

echo Starting the app...
pnpm run dev

pause
