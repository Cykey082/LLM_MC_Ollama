# LLM-MC 🤖⛏️

基于 Mineflayer 的 LLM 驱动 Minecraft 机器人框架

## 📖 概述

LLM-MC 是一个让大语言模型（LLM）控制 Minecraft 机器人的框架。采用 Python FastAPI 后端 + Node.js Bot 服务的混合架构，机器人可以感知游戏环境、与玩家交互，并根据 LLM 的决策执行各种动作。

## 🏗️ 架构

```
┌─────────────────────────────────────────────────────────────┐
│                        LLM-MC 框架                          │
├─────────────────────────┬───────────────────────────────────┤
│   Python FastAPI后端    │      Node.js Mineflayer服务       │
│   (backend/)            │      (bot/)                       │
│   ├── LLM调用          │      ├── MC机器人控制              │
│   ├── Agent决策逻辑    │  ←→  ├── 动作执行                  │
│   ├── API管理          │ HTTP │ ├── 状态感知                 │
│   └── REST API         │ WS   │ └── 事件推送                 │
└─────────────────────────┴───────────────────────────────────┘
        :8000                          :3001
```

### 工作流程
```
观察环境 → FastAPI获取状态 → LLM决策 → 发送动作指令 → Bot执行 → 循环
```

## 📁 项目结构

```
LLM-MC/
├── backend/                 # Python FastAPI 后端
│   ├── app/
│   │   ├── main.py         # FastAPI 入口
│   │   ├── config.py       # 配置管理
│   │   ├── agent/          # Agent 决策模块
│   │   ├── llm/            # LLM 客户端
│   │   ├── bot/            # Bot 服务客户端
│   │   ├── script/         # Python脚本执行器
│   │   └── api/            # API 路由
│   └── requirements.txt
├── bot/                     # Node.js Bot 服务
│   ├── src/
│   │   ├── index.js        # 服务入口
│   │   ├── server.js       # HTTP/WS 服务器
│   │   ├── bot.js          # Mineflayer 封装
│   │   ├── actions.js      # 动作库
│   │   └── observer.js     # 环境观察器
│   └── package.json
├── .env.example            # 环境变量模板
└── README.md
```

## 🚀 快速开始

### 1. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# LLM API 配置
LLM_API_KEY=your-api-key-here
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat

# Minecraft 服务器配置
MC_HOST=localhost
MC_PORT=25565
MC_USERNAME=LLM_Bot
MC_VERSION=1.20.1

# 服务配置
BOT_SERVICE_PORT=3001
BACKEND_PORT=8000
```

### 2. 安装依赖

**Bot 服务 (Node.js):**
```bash
cd bot
npm install
```

**后端服务 (Python):**
```bash
cd backend
pip install -r requirements.txt
```

### 3. 启动服务

**方式一：分别启动**

终端 1 - Bot 服务：
```bash
cd bot
npm start
```

终端 2 - Python 后端：
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**方式二：使用启动脚本**
```bash
# Windows
start_all.bat

# Linux/Mac
./start_all.sh
```

### 4. 使用 API

连接到 Minecraft：
```bash
curl -X POST http://localhost:8000/api/bot/connect
```

启动 Agent：
```bash
curl -X POST http://localhost:8000/api/agent/start
```

查看状态：
```bash
curl http://localhost:8000/api/agent/status
```

## 🎮 API 端点

### Agent 控制

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/agent/status` | 获取 Agent 状态 |
| POST | `/api/agent/start` | 启动 Agent 决策循环 |
| POST | `/api/agent/stop` | 停止 Agent |
| POST | `/api/agent/tick` | 强制执行一次决策 |

### Bot 控制

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/bot/status` | 获取 Bot 连接状态 |
| GET | `/api/bot/observation` | 获取当前游戏状态 |
| POST | `/api/bot/connect` | 连接 Minecraft 服务器 |
| POST | `/api/bot/disconnect` | 断开连接 |
| POST | `/api/bot/action` | 执行动作 |

### 脚本执行

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/script/execute` | 执行Python脚本完成复杂任务 |

### 可用动作

#### 基础动作
| 动作 | 描述 | 参数 |
|------|------|------|
| `chat` | 发送聊天消息 | `message` |
| `goTo` | 移动到指定坐标 | `x, y, z` |
| `followPlayer` | 跟随玩家 | `playerName` |
| `stopMoving` | 停止移动 | - |
| `jump` | 跳跃 | - |
| `lookAt` | 看向坐标 | `x, y, z` |
| `attack` | 攻击实体 | `entityType` |
| `collectBlock` | 采集方块 | `blockType` |
| `wait` | 等待 | `seconds` |

#### 物品栏动作
| 动作 | 描述 | 参数 |
|------|------|------|
| `viewInventory` | 查看背包物品 | - |
| `equipItem` | 装备物品 | `itemName` |
| `placeBlock` | 放置方块 | `blockName, x, y, z` |

#### 环境探测动作
| 动作 | 描述 | 参数 |
|------|------|------|
| `scanBlocks` | 扫描周围方块 | `blockTypes, range` |
| `findBlock` | 寻找最近方块 | `blockType, maxDistance` |
| `getBlockAt` | 获取指定位置方块 | `x, y, z` |
| `scanEntities` | 扫描周围实体 | `range, entityType` |

#### 高级动作
| 动作 | 描述 | 参数 |
|------|------|------|
| `executeScript` | 执行Python脚本 | `script, description, timeout` |

## 🔧 扩展开发

### 添加新动作

1. 在 `bot/src/actions.js` 中添加动作方法
2. 在 `getActionList()` 中注册动作
3. 在 `execute()` 中添加调用分支
4. 在 `backend/app/llm/prompts.py` 的 `AVAILABLE_ACTIONS` 中同步更新

### 自定义 Agent 行为

编辑 `backend/app/llm/prompts.py` 中的 `get_agent_system_prompt()` 函数来修改 Agent 的行为模式。

### 添加新的 API 端点

在 `backend/app/api/routes.py` 中添加新的路由。

## 🐍 Python脚本执行

LLM可以编写Python脚本来执行复杂的多步骤任务。脚本必须定义一个`async def main(bot)`函数。

### 示例：采集多个木头

```python
async def main(bot):
    for i in range(3):
        result = await bot.findBlock("oak_log", 32)
        if result.get("success") and result.get("position"):
            pos = result["position"]
            await bot.goTo(pos["x"], pos["y"], pos["z"])
            await bot.collectBlock("oak_log")
            await bot.chat(f"采集了第{i+1}个木头喵~")
        else:
            await bot.chat("找不到木头了喵...")
            break
    return "采集完成"
```

### 可用的Bot API

| 方法 | 描述 |
|------|------|
| `await bot.chat(message)` | 发送聊天消息 |
| `await bot.goTo(x, y, z)` | 移动到坐标 |
| `await bot.followPlayer(name)` | 跟随玩家 |
| `await bot.collectBlock(type)` | 采集方块 |
| `await bot.findBlock(type, range)` | 寻找方块 |
| `await bot.scanBlocks(types, range)` | 扫描方块 |
| `await bot.scanEntities(range, type)` | 扫描实体 |
| `await bot.equipItem(name)` | 装备物品 |
| `await bot.viewInventory()` | 查看背包 |
| `await bot.getPosition()` | 获取位置 |
| `await bot.getHealth()` | 获取生命值 |
| `bot.log(message)` | 记录日志 |

## 🛣️ 路线图

- [x] 基础 MVP 实现
- [x] Python FastAPI 后端迁移
- [x] 物品栏操作（查看、装备、放置）
- [x] 环境探测（扫描方块、实体）
- [x] Python脚本执行系统
- [ ] 记忆系统（长期目标追踪）
- [ ] 多机器人协作
- [ ] Web 控制面板
- [ ] 自定义插件系统

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！