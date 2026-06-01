@echo off
REM 啟動本機靜態伺服器，並綁定到所有網路介面，讓其他裝置可透過局域網存取
pushd "%~dp0"
echo 啟動本機靜態伺服器，請稍候...
python -m http.server 8000 --bind 0.0.0.0
pause
popd
