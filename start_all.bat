@echo off
chcp 65001 > nul
echo ========================================
echo        LLM-MC 机器人启动器
echo ========================================
echo.

:: 启动Bot服务
echo [1/4] 正在启动Bot服务...
start "LLM-MC Bot" cmd /k "cd bot && npm start"

:: 等待Bot服务启动
echo [2/4] 等待Bot服务初始化...
timeout /t 5 /nobreak > nul

:: 启动Python后端（使用虚拟环境）
echo [3/4] 正在启动Python后端...
start "LLM-MC Backend" cmd /k "cd backend && .venv\Scripts\activate && python -m uvicorn app.main:app --reload --port 8000"

:: 等待后端启动
echo [4/4] 等待后端初始化...
timeout /t 8 /nobreak > nul

echo.
echo ========================================
echo   正在连接Minecraft服务器...
echo ========================================
echo.

:: 连接MC
curl.exe -X POST http://localhost:8000/api/bot/connect -H "Content-Type: application/json"
echo.

:: 等待连接完成
timeout /t 3 /nobreak > nul

:: 启动Agent
echo.
echo ========================================
echo   正在启动AI Agent...
echo ========================================
echo.

curl.exe -X POST http://localhost:8000/api/agent/start -H "Content-Type: application/json"
echo.

echo.
echo ========================================
echo   所有服务已启动！
echo ========================================
echo.
echo Bot服务:    http://localhost:3001
echo 后端API:    http://localhost:8000
echo API文档:    http://localhost:8000/docs
echo.
echo 机器人应该已经进入你的Minecraft游戏了！
echo 按任意键关闭此启动器窗口...
pause > nul