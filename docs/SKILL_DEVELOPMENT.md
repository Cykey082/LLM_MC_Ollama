# 技能开发指南

本文档帮助你编写自定义技能，让 Bot 可以执行复杂的自动化任务。

## 目录

- [技能基础](#技能基础)
- [Bot API 参考](#bot-api-参考)
- [技能示例](#技能示例)
- [游戏内测试](#游戏内测试)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 技能基础

### 技能文件结构

技能文件保存在 `backend/skills/` 目录下，每个技能是一个 `.py` 文件。

```python
"""
技能: 技能名称
描述: 技能的功能描述
"""

async def 技能名称(bot, param1=默认值, param2=默认值):
    """
    技能的详细描述
    
    Args:
        bot: BotAPI实例，提供所有bot操作方法
        param1: 参数1的说明
        param2: 参数2的说明
    
    Returns:
        返回执行结果字典
    """
    # 你的代码
    return {"success": True, "message": "完成"}
```

### 技能索引

在 `backend/skills/index.json` 中注册技能：

```json
{
  "技能名称": {
    "name": "技能名称",
    "description": "技能描述",
    "params": ["param1", "param2"],
    "file": "技能名称.py"
  }
}
```

---

## Bot API 参考

### 移动类

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `await bot.goTo(x, y, z)` | 走到指定坐标 | `{"success": true, "message": "..."}` |
| `await bot.followPlayer(name)` | 跟随玩家 | `{"success": true, "message": "..."}` |
| `await bot.stopMoving()` | 停止移动 | `{"success": true, "message": "..."}` |
| `await bot.jump()` | 跳跃 | `{"success": true, "message": "..."}` |
| `await bot.lookAt(x, y, z)` | 看向坐标 | `{"success": true, "message": "..."}` |

### 采集/挖掘类

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `await bot.collectBlock(blockType)` | 寻找并挖掘方块 | `{"success": true, "message": "Mined oak_log at..."}` |
| `await bot.attack(entityType)` | 攻击最近的实体 | `{"success": true, "message": "..."}` |

### 物品类

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `await bot.viewInventory()` | 查看背包 | `{"success": true, "inventory": [{"name": "bread", "count": 5}, ...]}` |
| `await bot.equipItem(itemName)` | 装备物品到手上 | `{"success": true, "message": "..."}` |
| `await bot.placeBlock(blockName, x, y, z)` | 放置方块 | `{"success": true, "message": "..."}` |
| `await bot.dropItem(itemName, count)` | 丢弃物品 | `{"success": true, "message": "..."}` |
| `await bot.eat(foodName)` | 吃食物 | `{"success": true, "message": "..."}` |

### 环境感知类

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `await bot.findBlock(blockType, maxDistance)` | 寻找最近的方块 | `{"success": true, "found": true, "position": {"x": 0, "y": 0, "z": 0}, "distance": 5.2}` |
| `await bot.scanBlocks(blockTypes, range)` | 扫描多种方块 | `{"success": true, "results": {...}}` |
| `await bot.getBlockAt(x, y, z)` | 获取指定位置方块信息 | `{"success": true, "block": {"name": "stone", ...}}` |
| `await bot.scanEntities(range, entityType)` | 扫描周围实体 | `{"success": true, "entities": [...]}` |
| `await bot.canReach(x, y, z)` | 检查是否可达 | `{"success": true, "reachable": true, "pathLength": 10}` |
| `await bot.getPathTo(x, y, z)` | 获取路径（不移动） | `{"success": true, "found": true, "path": [...]}` |

### 状态获取类

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `await bot.getPosition()` | 获取当前位置 | `{"x": 0, "y": 64, "z": 0}` |
| `await bot.getHealth()` | 获取生命/饥饿值 | `{"health": 20, "food": 18}` |
| `await bot.getObservation()` | 获取完整观察状态 | `{...}` |

### 互动类

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `await bot.chat(message)` | 发送聊天消息 | `{"success": true, "message": "..."}` |
| `await bot.wait(seconds)` | 等待 | `{"success": true, "message": "..."}` |

### 合成/熔炼类

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `await bot.craft(itemName, count)` | 合成物品 | `{"success": true, "message": "Crafted 4 x oak_planks"}` |
| `await bot.listRecipes(itemName)` | 查看配方 | `{"success": true, "recipes": [...], "hasCraftingTable": true}` |
| `await bot.smelt(itemName, fuelName, count)` | 熔炉烧制 | `{"success": true, "smelted": 5}` |
| `await bot.findCraftingTable(maxDistance)` | 寻找工作台 | `{"success": true, "found": true, "position": {...}}` |
| `await bot.findFurnace(maxDistance)` | 寻找熔炉 | `{"success": true, "found": true, "furnaceType": "furnace"}` |

### 容器操作类

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `await bot.openContainer(x, y, z)` | 打开容器 | `{"success": true, "items": [...], "containerType": "chest"}` |
| `await bot.closeContainer()` | 关闭容器 | `{"success": true, "message": "..."}` |
| `await bot.depositItem(itemName, count)` | 存入物品 | `{"success": true, "message": "Deposited 10 x oak_log"}` |
| `await bot.withdrawItem(itemName, count)` | 取出物品 | `{"success": true, "message": "Withdrew 5 x diamond"}` |
| `await bot.findChest(maxDistance)` | 寻找箱子 | `{"success": true, "found": true, "containerType": "chest"}` |

### 日志类

| 方法 | 说明 |
|------|------|
| `bot.log(message)` | 输出日志（同步方法，不需要 await） |

---

## 技能示例

### 示例1：采集指定数量的方块

```python
"""
技能: 采集方块
描述: 采集指定类型和数量的方块
"""

async def 采集方块(bot, blockType="oak_log", count=1):
    """
    采集指定类型和数量的方块
    
    Args:
        bot: BotAPI实例
        blockType: 方块类型（如 oak_log, stone, diamond_ore）
        count: 要采集的数量
    """
    collected = 0
    max_attempts = count * 3  # 最多尝试次数
    attempts = 0
    
    while collected < count and attempts < max_attempts:
        attempts += 1
        
        # 寻找方块
        result = await bot.findBlock(blockType, 32)
        if not result.get("found"):
            await bot.chat(f"找不到 {blockType} 了")
            break
        
        # 采集
        collect_result = await bot.collectBlock(blockType)
        if collect_result.get("success"):
            collected += 1
            bot.log(f"采集进度: {collected}/{count}")
        else:
            bot.log(f"采集失败: {collect_result.get('message')}")
    
    return {
        "success": collected >= count,
        "collected": collected,
        "target": count,
        "message": f"采集了 {collected}/{count} 个 {blockType}"
    }
```

### 示例2：自动巡逻

```python
"""
技能: 巡逻
描述: 在指定坐标之间来回巡逻
"""

async def 巡逻(bot, rounds=3):
    """
    在两个点之间来回巡逻
    
    Args:
        bot: BotAPI实例
        rounds: 巡逻轮数
    """
    # 获取起始位置
    start_pos = await bot.getPosition()
    
    # 定义巡逻点（相对于起始位置）
    patrol_points = [
        (start_pos["x"] + 10, start_pos["y"], start_pos["z"]),
        (start_pos["x"] + 10, start_pos["y"], start_pos["z"] + 10),
        (start_pos["x"], start_pos["y"], start_pos["z"] + 10),
        (start_pos["x"], start_pos["y"], start_pos["z"]),
    ]
    
    for round_num in range(rounds):
        await bot.chat(f"开始第 {round_num + 1} 轮巡逻")
        
        for i, (x, y, z) in enumerate(patrol_points):
            bot.log(f"前往巡逻点 {i + 1}")
            result = await bot.goTo(x, y, z)
            
            if not result.get("success"):
                bot.log(f"无法到达巡逻点: {result.get('message')}")
                continue
            
            # 到达后扫描周围敌对生物
            entities = await bot.scanEntities(16)
            hostile = [e for e in entities.get("entities", []) if e.get("isHostile")]
            
            if hostile:
                await bot.chat(f"发现 {len(hostile)} 个敌人!")
            
            await bot.wait(2)  # 在每个点停留2秒
    
    await bot.chat("巡逻完成!")
    return {"success": True, "message": f"完成 {rounds} 轮巡逻"}
```

### 示例3：寻找并跟随玩家

```python
"""
技能: 寻找玩家
描述: 寻找指定玩家并跟随
"""

async def 寻找玩家(bot, playerName="Steve", followTime=30):
    """
    寻找玩家并跟随一段时间
    
    Args:
        bot: BotAPI实例
        playerName: 玩家名称
        followTime: 跟随时间（秒）
    """
    # 扫描附近玩家
    entities = await bot.scanEntities(64, "player")
    players = entities.get("entities", [])
    
    # 寻找目标玩家
    target = None
    for p in players:
        if p.get("name") == playerName:
            target = p
            break
    
    if not target:
        return {"success": False, "message": f"找不到玩家 {playerName}"}
    
    await bot.chat(f"找到 {playerName}，开始跟随~")
    
    # 跟随玩家
    result = await bot.followPlayer(playerName)
    if not result.get("success"):
        return {"success": False, "message": f"无法跟随: {result.get('message')}"}
    
    # 跟随指定时间
    await bot.wait(followTime)
    
    # 停止跟随
    await bot.stopMoving()
    await bot.chat("跟随结束~")
    
    return {"success": True, "message": f"跟随 {playerName} {followTime} 秒"}
```

### 示例4：自动吃饭

```python
"""
技能: 自动吃饭
描述: 当饥饿值低于阈值时自动吃东西
"""

async def 自动吃饭(bot, threshold=10):
    """
    检查饥饿值并吃东西
    
    Args:
        bot: BotAPI实例
        threshold: 饥饿值阈值，低于此值则吃东西
    """
    health = await bot.getHealth()
    food = health.get("food", 20)
    
    if food >= threshold:
        return {
            "success": True,
            "ate": False,
            "message": f"饥饿值 {food} 足够，不需要吃东西"
        }
    
    bot.log(f"饥饿值 {food} 低于 {threshold}，需要吃东西")
    
    # 尝试吃东西
    result = await bot.eat()
    
    if result.get("success"):
        new_health = await bot.getHealth()
        return {
            "success": True,
            "ate": True,
            "food_before": food,
            "food_after": new_health.get("food"),
            "message": f"吃了 {result.get('food')}，饥饿值: {food} -> {new_health.get('food')}"
        }
    else:
        return {
            "success": False,
            "ate": False,
            "message": f"吃东西失败: {result.get('message')}"
        }
```

### 示例5：合成物品

```python
"""
技能: 制作工具
描述: 自动采集材料并合成工具
"""

async def 制作工具(bot, toolType="wooden_pickaxe"):
    """
    采集材料并合成指定工具
    
    Args:
        bot: BotAPI实例
        toolType: 工具类型（如 wooden_pickaxe, stone_sword）
    """
    # 首先检查是否有工作台
    table = await bot.findCraftingTable(32)
    
    if not table.get("found"):
        bot.log("没有工作台，需要先制作一个")
        
        # 采集木头
        for i in range(2):
            result = await bot.collectBlock("oak_log")
            if not result.get("success"):
                return {"success": False, "message": "无法采集木头"}
        
        # 合成木板
        craft_result = await bot.craft("oak_planks", 4)
        if not craft_result.get("success"):
            return {"success": False, "message": "无法合成木板"}
        
        # 合成工作台
        craft_result = await bot.craft("crafting_table", 1)
        if not craft_result.get("success"):
            return {"success": False, "message": "无法合成工作台"}
        
        # 放置工作台
        pos = await bot.getPosition()
        await bot.placeBlock("crafting_table", int(pos["x"]) + 1, int(pos["y"]), int(pos["z"]))
    
    # 查看需要的配方
    recipes = await bot.listRecipes(toolType)
    if not recipes.get("recipes"):
        return {"success": False, "message": f"没有 {toolType} 的配方"}
    
    bot.log(f"配方: {recipes['recipes'][0]}")
    
    # 合成工具
    result = await bot.craft(toolType, 1)
    
    if result.get("success"):
        await bot.chat(f"成功合成了 {toolType}!")
        return {"success": True, "message": f"合成了 {toolType}"}
    else:
        return {"success": False, "message": result.get("message")}
```

### 示例6：整理箱子

```python
"""
技能: 整理箱子
描述: 将背包中指定物品存入最近的箱子
"""

async def 整理箱子(bot, itemTypes=None):
    """
    将物品存入箱子
    
    Args:
        bot: BotAPI实例
        itemTypes: 要存入的物品类型列表（默认存入所有矿石）
    """
    if itemTypes is None:
        itemTypes = ["cobblestone", "dirt", "gravel", "coal", "raw_iron", "raw_copper"]
    
    # 寻找箱子
    chest = await bot.findChest(32)
    if not chest.get("found"):
        return {"success": False, "message": "附近没有找到箱子"}
    
    pos = chest["position"]
    bot.log(f"找到箱子在 ({pos['x']}, {pos['y']}, {pos['z']})")
    
    # 打开箱子
    open_result = await bot.openContainer(pos["x"], pos["y"], pos["z"])
    if not open_result.get("success"):
        return {"success": False, "message": "无法打开箱子"}
    
    deposited = []
    
    # 存入物品
    inventory = await bot.viewInventory()
    for item in inventory.get("inventory", []):
        if item["name"] in itemTypes:
            result = await bot.depositItem(item["name"])
            if result.get("success"):
                deposited.append(f"{item['name']} x{item['count']}")
                bot.log(f"存入: {item['name']} x{item['count']}")
    
    # 关闭箱子
    await bot.closeContainer()
    
    if deposited:
        await bot.chat(f"整理完成！存入了 {len(deposited)} 种物品")
        return {"success": True, "deposited": deposited, "message": f"存入了 {len(deposited)} 种物品"}
    else:
        return {"success": True, "deposited": [], "message": "没有需要存入的物品"}
```

---

## 游戏内测试

### 测试指令

在 Minecraft 聊天中使用：

```
%skills           # 列出所有技能
%test 技能名       # 测试技能（使用默认参数）
%test 技能名(参数=值)  # 带参数测试
%stop             # 停止当前技能
%help             # 显示帮助
```

### 测试示例

```
%test 采集木头(count=5)
%test 巡逻(rounds=2)
%test 寻找玩家(playerName="Steve", followTime=60)
%test 自动吃饭(threshold=15)
```

### 参数格式

- **字符串**: `param="value"` 或 `param='value'`
- **数字**: `param=123` 或 `param=3.14`
- **多参数**: `param1=value1, param2=value2`

---

## 最佳实践

### 1. 错误处理

```python
async def 安全的技能(bot):
    try:
        result = await bot.goTo(100, 64, 100)
        if not result.get("success"):
            bot.log(f"移动失败: {result.get('message')}")
            return {"success": False, "message": result.get("message")}
        # 继续...
    except Exception as e:
        bot.log(f"发生错误: {e}")
        return {"success": False, "error": str(e)}
```

### 2. 日志输出

使用 `bot.log()` 记录重要步骤，方便调试：

```python
bot.log("开始执行任务")
bot.log(f"找到目标在 ({x}, {y}, {z})")
bot.log(f"当前进度: {current}/{total}")
```

### 3. 聊天反馈

适当使用 `bot.chat()` 让玩家知道进度：

```python
await bot.chat("开始采集木头~")
await bot.chat(f"采集进度: {i}/{count}")
await bot.chat("任务完成!")
```

### 4. 检查可达性

在移动前检查目标是否可达：

```python
check = await bot.canReach(x, y, z)
if not check.get("reachable"):
    bot.log("目标不可达，尝试其他方案")
    # ...
```

### 5. 返回结果格式

统一使用字典返回结果：

```python
return {
    "success": True,           # 是否成功
    "message": "完成",          # 消息
    # 其他自定义字段...
}
```

---

## 常见问题

### Q: 技能保存后没有生效？

确保在 `index.json` 中注册了技能，并重启后端服务。

### Q: 参数传不进去？

检查参数名是否匹配，使用 `%test 技能名(参数名=值)` 格式。

### Q: 技能卡住了怎么办？

使用 `%stop` 命令停止当前技能。

### Q: 如何调试技能？

1. 使用 `bot.log()` 输出日志
2. 查看后端控制台输出
3. 使用 `%test` 单独测试每个步骤

### Q: collectBlock 失败怎么办？

可能原因：
- 方块太远或太高
- 路径被阻挡
- 没有合适的工具

解决方案：
- 先检查 `findBlock` 返回的位置
- 使用 `canReach` 检查可达性
- 考虑先装备合适的工具

---

## 方块名称参考

常用方块名称（使用 Minecraft 英文 ID）：

### 木头类
- `oak_log` - 橡木
- `birch_log` - 白桦木
- `spruce_log` - 云杉木
- `jungle_log` - 丛林木
- `acacia_log` - 金合欢木
- `dark_oak_log` - 深色橡木

### 矿石类
- `coal_ore` - 煤矿
- `iron_ore` - 铁矿
- `gold_ore` - 金矿
- `diamond_ore` - 钻石矿
- `copper_ore` - 铜矿
- `lapis_ore` - 青金石矿

### 常见方块
- `stone` - 石头
- `dirt` - 泥土
- `grass_block` - 草方块
- `sand` - 沙子
- `gravel` - 砂砾
- `cobblestone` - 圆石

---

## 食物名称参考

- `bread` - 面包
- `cooked_beef` - 熟牛排
- `cooked_porkchop` - 熟猪排
- `cooked_chicken` - 熟鸡肉
- `apple` - 苹果
- `golden_apple` - 金苹果
- `carrot` - 胡萝卜
- `baked_potato` - 烤土豆

---

*更多问题欢迎查阅源码或提交 Issue！*