@echo off
echo Installing frontend dependencies...
cd frontend
npm install
cd ../backend
npm install
cd ..

echo All dependencies installed successfully!
pause

npm start 