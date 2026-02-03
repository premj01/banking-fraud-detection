@echo off
echo Creating Python virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Generating gRPC code from proto file...
python -m grpc_tools.protoc -I../proto --python_out=. --grpc_python_out=. ../proto/fraud_detection.proto

echo Setup complete!
echo To start the server, run: start-server.bat
