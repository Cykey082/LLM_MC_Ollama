import pathfinderPkg from 'mineflayer-pathfinder';
const { goals } = pathfinderPkg;
import Vec3 from 'vec3';
import minecraftData from 'minecraft-data';

/**
 * Action system for the bot
 * Provides high-level actions that can be invoked via API
 */
export class Actions {
  constructor(bot) {
    this.bot = bot;
    this.mcBot = bot.getMineflayerBot();
  }

  /**
   * Get available actions list
   * @returns {Array<{name: string, description: string, parameters: object}>}
   */
  static getActionList() {
    return [
      {
        name: 'chat',
        description: 'Send a chat message to the server',
        parameters: { message: 'string - The message to send' }
      },
      {
        name: 'goTo',
        description: 'Walk to a specific coordinate',
        parameters: { x: 'number', y: 'number', z: 'number' }
      },
      {
        name: 'followPlayer',
        description: 'Follow a specific player',
        parameters: { playerName: 'string - Name of the player to follow' }
      },
      {
        name: 'stopMoving',
        description: 'Stop all movement',
        parameters: {}
      },
      {
        name: 'jump',
        description: 'Make the bot jump',
        parameters: {}
      },
      {
        name: 'lookAt',
        description: 'Look at a specific coordinate',
        parameters: { x: 'number', y: 'number', z: 'number' }
      },
      {
        name: 'attack',
        description: 'Attack the nearest entity of specified type',
        parameters: { entityType: 'string - Type of entity to attack (e.g., zombie, skeleton)' }
      },
      {
        name: 'collectBlock',
        description: 'Mine and collect a specific type of block nearby',
        parameters: { blockType: 'string - Type of block to collect (e.g., oak_log, stone)' }
      },
      {
        name: 'wait',
        description: 'Wait for a specified duration',
        parameters: { seconds: 'number - Duration to wait in seconds' }
      },
      {
        name: 'viewInventory',
        description: 'View all items in inventory/backpack and return the list',
        parameters: {}
      },
      {
        name: 'equipItem',
        description: 'Equip an item to hand (hold it)',
        parameters: { itemName: 'string - Name of the item to equip (e.g., diamond_sword, diamond_pickaxe)' }
      },
      {
        name: 'placeBlock',
        description: 'Place a block at a specific position',
        parameters: {
          blockName: 'string - Name of the block to place (must be in inventory)',
          x: 'number - X coordinate',
          y: 'number - Y coordinate',
          z: 'number - Z coordinate'
        }
      },
      {
        name: 'scanBlocks',
        description: 'Scan and count blocks of specified types within a range',
        parameters: {
          blockTypes: 'array - List of block names to search for (e.g., ["diamond_ore", "iron_ore"])',
          range: 'number - Search radius (default: 16, max: 32)'
        }
      },
      {
        name: 'findBlock',
        description: 'Find the nearest block of a specific type and return its location',
        parameters: {
          blockType: 'string - Block name to find (e.g., diamond_ore, water)',
          maxDistance: 'number - Maximum search distance (default: 32)'
        }
      },
      {
        name: 'getBlockAt',
        description: 'Get information about the block at a specific coordinate',
        parameters: {
          x: 'number - X coordinate',
          y: 'number - Y coordinate',
          z: 'number - Z coordinate'
        }
      },
      {
        name: 'scanEntities',
        description: 'Scan all entities within range and return detailed information',
        parameters: {
          range: 'number - Search radius (default: 16)',
          entityType: 'string - Optional: filter by entity type (e.g., player, zombie, cow)'
        }
      },
      {
        name: 'dropItem',
        description: 'Drop/throw items from inventory',
        parameters: {
          itemName: 'string - Name of the item to drop',
          count: 'number - Optional: number of items to drop (default: all)'
        }
      },
      {
        name: 'eat',
        description: 'Eat food to restore hunger',
        parameters: {
          foodName: 'string - Optional: specific food to eat (if not provided, will eat any food)'
        }
      },
      {
        name: 'canReach',
        description: 'Check if a coordinate is reachable by pathfinding (without actually moving)',
        parameters: {
          x: 'number - X coordinate',
          y: 'number - Y coordinate',
          z: 'number - Z coordinate'
        }
      },
      {
        name: 'getPathTo',
        description: 'Calculate and return the path to a coordinate (without moving)',
        parameters: {
          x: 'number - X coordinate',
          y: 'number - Y coordinate',
          z: 'number - Z coordinate'
        }
      }
    ];
  }

  /**
   * Execute an action by name
   * @param {string} actionName 
   * @param {object} params 
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async execute(actionName, params = {}) {
    try {
      switch (actionName) {
        case 'chat':
          return await this.chat(params.message);
        case 'goTo':
          return await this.goTo(params.x, params.y, params.z);
        case 'followPlayer':
          return await this.followPlayer(params.playerName);
        case 'stopMoving':
          return await this.stopMoving();
        case 'jump':
          return await this.jump();
        case 'lookAt':
          return await this.lookAt(params.x, params.y, params.z);
        case 'attack':
          return await this.attack(params.entityType);
        case 'collectBlock':
          return await this.collectBlock(params.blockType);
        case 'wait':
          return await this.wait(params.seconds);
        case 'viewInventory':
          return await this.viewInventory();
        case 'equipItem':
          return await this.equipItem(params.itemName);
        case 'placeBlock':
          return await this.placeBlock(params.blockName, params.x, params.y, params.z);
        case 'scanBlocks':
          return await this.scanBlocks(params.blockTypes, params.range);
        case 'findBlock':
          return await this.findBlock(params.blockType, params.maxDistance);
        case 'getBlockAt':
          return await this.getBlockAt(params.x, params.y, params.z);
        case 'scanEntities':
          return await this.scanEntities(params.range, params.entityType);
        case 'dropItem':
          return await this.dropItem(params.itemName, params.count);
        case 'eat':
          return await this.eat(params.foodName);
        case 'canReach':
          return await this.canReach(params.x, params.y, params.z);
        case 'getPathTo':
          return await this.getPathTo(params.x, params.y, params.z);
        default:
          return { success: false, message: `Unknown action: ${actionName}` };
      }
    } catch (error) {
      return { success: false, message: `Action failed: ${error.message}` };
    }
  }

  /**
   * Send chat message
   */
  async chat(message) {
    this.mcBot.chat(message);
    return { success: true, message: `Said: ${message}` };
  }

  /**
   * Navigate to coordinates
   */
  async goTo(x, y, z) {
    const goal = new goals.GoalBlock(x, y, z);
    
    return new Promise((resolve) => {
      let resolved = false;
      
      const cleanup = () => {
        this.mcBot.removeListener('goal_reached', onGoalReached);
        this.mcBot.removeListener('path_update', onPathUpdate);
        this.mcBot.removeListener('path_stop', onPathStop);
      };
      
      const finish = (result) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve(result);
      };
      
      const onGoalReached = () => {
        finish({ success: true, message: `Arrived at (${x}, ${y}, ${z})` });
      };
      
      const onPathUpdate = (results) => {
        // 检查路径状态
        if (results.status === 'noPath') {
          this.mcBot.pathfinder.setGoal(null);
          finish({ success: false, message: `Cannot find path to (${x}, ${y}, ${z}) - no path exists` });
        } else if (results.status === 'timeout') {
          this.mcBot.pathfinder.setGoal(null);
          finish({ success: false, message: `Path calculation timeout to (${x}, ${y}, ${z})` });
        }
      };
      
      const onPathStop = () => {
        // 路径被中断（可能是被阻挡或其他原因）
        // 检查是否已经到达目标附近
        const currentPos = this.mcBot.entity.position;
        const distance = Math.sqrt(
          Math.pow(currentPos.x - x, 2) +
          Math.pow(currentPos.y - y, 2) +
          Math.pow(currentPos.z - z, 2)
        );
        
        if (distance < 2) {
          finish({ success: true, message: `Arrived near (${x}, ${y}, ${z}), distance: ${distance.toFixed(1)}` });
        }
        // 如果没到达，不做处理，等待超时或其他事件
      };
      
      this.mcBot.on('goal_reached', onGoalReached);
      this.mcBot.on('path_update', onPathUpdate);
      this.mcBot.on('path_stop', onPathStop);
      
      this.mcBot.pathfinder.setGoal(goal);

      // Timeout after 120 seconds (increased for long journeys)
      setTimeout(() => {
        this.mcBot.pathfinder.setGoal(null);
        const currentPos = this.mcBot.entity.position;
        const distance = Math.sqrt(
          Math.pow(currentPos.x - x, 2) +
          Math.pow(currentPos.y - y, 2) +
          Math.pow(currentPos.z - z, 2)
        );
        finish({
          success: false,
          message: `Navigation timeout after 120s. Current distance to target: ${distance.toFixed(1)} blocks`
        });
      }, 120000);
    });
  }

  /**
   * Follow a player
   */
  async followPlayer(playerName) {
    const player = this.mcBot.players[playerName];
    if (!player || !player.entity) {
      return { success: false, message: `Player ${playerName} not found or not in range` };
    }

    const goal = new goals.GoalFollow(player.entity, 2);
    this.mcBot.pathfinder.setGoal(goal, true); // dynamic goal
    return { success: true, message: `Following player ${playerName}` };
  }

  /**
   * Stop all movement
   */
  async stopMoving() {
    this.mcBot.pathfinder.setGoal(null);
    this.mcBot.clearControlStates();
    return { success: true, message: 'Stopped moving' };
  }

  /**
   * Jump once
   */
  async jump() {
    this.mcBot.setControlState('jump', true);
    await new Promise(r => setTimeout(r, 250));
    this.mcBot.setControlState('jump', false);
    return { success: true, message: 'Jumped' };
  }

  /**
   * Look at coordinates
   */
  async lookAt(x, y, z) {
    await this.mcBot.lookAt(new Vec3(x, y, z));
    return { success: true, message: `Looking at (${x}, ${y}, ${z})` };
  }

  /**
   * Attack nearest entity of type
   */
  async attack(entityType) {
    const entity = this.mcBot.nearestEntity((e) => {
      return e.name === entityType || e.mobType === entityType;
    });

    if (!entity) {
      return { success: false, message: `No ${entityType} found nearby` };
    }

    await this.mcBot.attack(entity);
    return { success: true, message: `Attacked ${entityType}` };
  }

  /**
   * Collect/mine a block type
   */
  async collectBlock(blockType) {
    const mcData = minecraftData(this.mcBot.version);
    const blockId = mcData.blocksByName[blockType]?.id;
    
    if (!blockId) {
      return { success: false, message: `Unknown block type: ${blockType}` };
    }

    const block = this.mcBot.findBlock({
      matching: blockId,
      maxDistance: 32
    });

    if (!block) {
      return { success: false, message: `No ${blockType} found nearby` };
    }

    // 检查是否在挖掘范围内（大约4-5格）
    const distance = this.mcBot.entity.position.distanceTo(block.position);
    
    if (distance > 4.5) {
      // 需要先走近一点
      try {
        // 走到方块旁边
        const goal = new goals.GoalNear(block.position.x, block.position.y, block.position.z, 3);
        
        await new Promise((resolve, reject) => {
          let resolved = false;
          
          const cleanup = () => {
            this.mcBot.removeListener('goal_reached', onGoalReached);
            this.mcBot.removeListener('path_update', onPathUpdate);
          };
          
          const onGoalReached = () => {
            if (resolved) return;
            resolved = true;
            cleanup();
            resolve();
          };
          
          const onPathUpdate = (results) => {
            if (resolved) return;
            if (results.status === 'noPath') {
              resolved = true;
              cleanup();
              this.mcBot.pathfinder.setGoal(null);
              reject(new Error('Cannot reach the block'));
            }
          };
          
          this.mcBot.on('goal_reached', onGoalReached);
          this.mcBot.on('path_update', onPathUpdate);
          
          this.mcBot.pathfinder.setGoal(goal);
          
          // 30秒超时
          setTimeout(() => {
            if (resolved) return;
            resolved = true;
            cleanup();
            this.mcBot.pathfinder.setGoal(null);
            // 检查是否已经足够近
            const newDistance = this.mcBot.entity.position.distanceTo(block.position);
            if (newDistance <= 4.5) {
              resolve();
            } else {
              reject(new Error(`Timeout walking to block, still ${newDistance.toFixed(1)} blocks away`));
            }
          }, 30000);
        });
      } catch (error) {
        return { success: false, message: `Failed to reach block: ${error.message}` };
      }
    }

    // 重新获取方块（可能位置变化了）
    const targetBlock = this.mcBot.blockAt(block.position);
    if (!targetBlock || targetBlock.name !== blockType) {
      return { success: false, message: `Block ${blockType} no longer exists at that position` };
    }

    try {
      await this.mcBot.dig(targetBlock);
      return { success: true, message: `Mined ${blockType} at (${block.position.x}, ${block.position.y}, ${block.position.z})` };
    } catch (error) {
      return { success: false, message: `Failed to mine: ${error.message}` };
    }
  }

  /**
   * Wait for duration
   */
  async wait(seconds) {
    await new Promise(r => setTimeout(r, seconds * 1000));
    return { success: true, message: `Waited ${seconds} seconds` };
  }

  /**
   * View inventory - list all items in inventory
   */
  async viewInventory() {
    const items = this.mcBot.inventory.items();
    
    if (items.length === 0) {
      return {
        success: true,
        message: 'Inventory is empty',
        inventory: []
      };
    }

    const inventoryList = items.map(item => ({
      name: item.name,
      displayName: item.displayName,
      count: item.count,
      slot: item.slot
    }));

    // 生成可读的文字描述
    const itemsText = inventoryList.map(i => `${i.name} x${i.count}`).join(', ');
    
    return {
      success: true,
      message: `Inventory (${items.length} items): ${itemsText}`,
      inventory: inventoryList
    };
  }

  /**
   * Equip an item to hand
   */
  async equipItem(itemName) {
    const item = this.mcBot.inventory.items().find(i =>
      i.name === itemName || i.name.includes(itemName)
    );

    if (!item) {
      return { success: false, message: `Item ${itemName} not found in inventory` };
    }

    try {
      await this.mcBot.equip(item, 'hand');
      return { success: true, message: `Equipped ${item.name} to hand` };
    } catch (error) {
      return { success: false, message: `Failed to equip: ${error.message}` };
    }
  }

  /**
   * Place a block at specific coordinates
   */
  async placeBlock(blockName, x, y, z) {
    // 1. 先检查背包里有没有这个方块
    const blockItem = this.mcBot.inventory.items().find(i =>
      i.name === blockName || i.name.includes(blockName)
    );

    if (!blockItem) {
      return { success: false, message: `Block ${blockName} not found in inventory` };
    }

    // 2. 装备方块到手上
    try {
      await this.mcBot.equip(blockItem, 'hand');
    } catch (error) {
      return { success: false, message: `Failed to equip block: ${error.message}` };
    }

    // 3. 找到要放置位置相邻的参考方块
    const targetPos = new Vec3(x, y, z);
    
    // 尝试找到目标位置下方的方块作为参考
    const referencePositions = [
      new Vec3(x, y - 1, z),  // 下方
      new Vec3(x - 1, y, z),  // 西边
      new Vec3(x + 1, y, z),  // 东边
      new Vec3(x, y, z - 1),  // 北边
      new Vec3(x, y, z + 1),  // 南边
      new Vec3(x, y + 1, z),  // 上方
    ];

    let referenceBlock = null;
    let faceVector = null;

    for (const pos of referencePositions) {
      const block = this.mcBot.blockAt(pos);
      if (block && block.name !== 'air') {
        referenceBlock = block;
        // 计算放置的面向
        faceVector = new Vec3(
          x - pos.x,
          y - pos.y,
          z - pos.z
        );
        break;
      }
    }

    if (!referenceBlock) {
      return { success: false, message: `No adjacent block found to place against at (${x}, ${y}, ${z})` };
    }

    // 4. 放置方块
    try {
      await this.mcBot.placeBlock(referenceBlock, faceVector);
      return { success: true, message: `Placed ${blockName} at (${x}, ${y}, ${z})` };
    } catch (error) {
      return { success: false, message: `Failed to place block: ${error.message}` };
    }
  }

  /**
   * Scan blocks of specified types within range
   */
  async scanBlocks(blockTypes, range = 16) {
    const mcData = minecraftData(this.mcBot.version);
    const maxRange = Math.min(range, 32);
    
    // 将方块名转换为ID
    const blockIds = [];
    const validBlockTypes = [];
    
    for (const blockType of blockTypes) {
      const blockInfo = mcData.blocksByName[blockType];
      if (blockInfo) {
        blockIds.push(blockInfo.id);
        validBlockTypes.push(blockType);
      }
    }
    
    if (blockIds.length === 0) {
      return { success: false, message: 'No valid block types specified' };
    }

    // 统计每种方块的数量和位置
    const results = {};
    for (const blockType of validBlockTypes) {
      results[blockType] = { count: 0, nearest: null, positions: [] };
    }
    
    const botPos = this.mcBot.entity.position;
    
    // 扫描范围内的方块
    const blocks = this.mcBot.findBlocks({
      matching: blockIds,
      maxDistance: maxRange,
      count: 100  // 最多返回100个
    });
    
    for (const pos of blocks) {
      const block = this.mcBot.blockAt(pos);
      if (block) {
        const blockType = block.name;
        if (results[blockType]) {
          results[blockType].count++;
          const distance = botPos.distanceTo(pos);
          results[blockType].positions.push({
            x: pos.x, y: pos.y, z: pos.z,
            distance: Math.round(distance * 10) / 10
          });
          
          // 更新最近的方块
          if (!results[blockType].nearest || distance < results[blockType].nearest.distance) {
            results[blockType].nearest = {
              x: pos.x, y: pos.y, z: pos.z,
              distance: Math.round(distance * 10) / 10
            };
          }
        }
      }
    }

    // 生成消息
    const summary = validBlockTypes.map(t => `${t}: ${results[t].count}`).join(', ');
    
    return {
      success: true,
      message: `Scan results within ${maxRange} blocks: ${summary}`,
      results: results
    };
  }

  /**
   * Find the nearest block of a specific type
   */
  async findBlock(blockType, maxDistance = 32) {
    const mcData = minecraftData(this.mcBot.version);
    const blockInfo = mcData.blocksByName[blockType];
    
    if (!blockInfo) {
      return { success: false, message: `Unknown block type: ${blockType}` };
    }

    const block = this.mcBot.findBlock({
      matching: blockInfo.id,
      maxDistance: Math.min(maxDistance, 64)
    });

    if (!block) {
      return {
        success: true,
        message: `No ${blockType} found within ${maxDistance} blocks`,
        found: false
      };
    }

    const distance = this.mcBot.entity.position.distanceTo(block.position);
    
    return {
      success: true,
      message: `Found ${blockType} at (${block.position.x}, ${block.position.y}, ${block.position.z}), distance: ${Math.round(distance * 10) / 10}`,
      found: true,
      blockName: block.name,
      position: {
        x: block.position.x,
        y: block.position.y,
        z: block.position.z
      },
      distance: Math.round(distance * 10) / 10
    };
  }

  /**
   * Get block info at specific coordinates
   */
  async getBlockAt(x, y, z) {
    const block = this.mcBot.blockAt(new Vec3(x, y, z));
    
    if (!block) {
      return { success: false, message: `Cannot access block at (${x}, ${y}, ${z})` };
    }

    const distance = this.mcBot.entity.position.distanceTo(block.position);
    
    return {
      success: true,
      message: `Block at (${x}, ${y}, ${z}): ${block.name}`,
      block: {
        name: block.name,
        displayName: block.displayName,
        type: block.type,
        hardness: block.hardness,
        diggable: block.diggable,
        transparent: block.transparent,
        light: block.light,
        x: x,
        y: y,
        z: z,
        distance: Math.round(distance * 10) / 10
      }
    };
  }

  /**
   * Drop items from inventory
   */
  async dropItem(itemName, count = null) {
    const item = this.mcBot.inventory.items().find(i =>
      i.name === itemName || i.name.includes(itemName)
    );

    if (!item) {
      return { success: false, message: `Item ${itemName} not found in inventory` };
    }

    try {
      // 如果没指定数量，丢弃全部
      const dropCount = count || item.count;
      await this.mcBot.toss(item.type, null, Math.min(dropCount, item.count));
      return {
        success: true,
        message: `Dropped ${Math.min(dropCount, item.count)} x ${item.name}`
      };
    } catch (error) {
      return { success: false, message: `Failed to drop item: ${error.message}` };
    }
  }

  /**
   * Eat food to restore hunger
   */
  async eat(foodName = null) {
    // 常见食物列表
    const foodItems = [
      'bread', 'cooked_beef', 'cooked_porkchop', 'cooked_chicken', 'cooked_mutton',
      'cooked_rabbit', 'cooked_cod', 'cooked_salmon', 'baked_potato', 'cookie',
      'pumpkin_pie', 'golden_apple', 'enchanted_golden_apple', 'golden_carrot',
      'apple', 'melon_slice', 'sweet_berries', 'carrot', 'potato', 'beetroot',
      'dried_kelp', 'beef', 'porkchop', 'chicken', 'rabbit', 'mutton', 'cod', 'salmon',
      'tropical_fish', 'rotten_flesh', 'spider_eye', 'chorus_fruit', 'honey_bottle',
      'mushroom_stew', 'rabbit_stew', 'beetroot_soup', 'suspicious_stew'
    ];

    let foodItem = null;

    if (foodName) {
      // 寻找指定的食物
      foodItem = this.mcBot.inventory.items().find(i =>
        i.name === foodName || i.name.includes(foodName)
      );
      if (!foodItem) {
        return { success: false, message: `Food ${foodName} not found in inventory` };
      }
    } else {
      // 自动找任何可吃的食物
      for (const item of this.mcBot.inventory.items()) {
        if (foodItems.includes(item.name)) {
          foodItem = item;
          break;
        }
      }
      if (!foodItem) {
        return { success: false, message: 'No food found in inventory' };
      }
    }

    try {
      // 先装备食物
      await this.mcBot.equip(foodItem, 'hand');
      // 然后消耗它
      await this.mcBot.consume();
      return {
        success: true,
        message: `Ate ${foodItem.name}`,
        food: foodItem.name
      };
    } catch (error) {
      return { success: false, message: `Failed to eat: ${error.message}` };
    }
  }

  /**
   * Scan entities within range
   */
  async scanEntities(range = 16, entityType = null) {
    const maxRange = Math.min(range, 64);
    const botPos = this.mcBot.entity.position;
    const entities = [];
    
    for (const entity of Object.values(this.mcBot.entities)) {
      if (entity === this.mcBot.entity) continue;
      
      const distance = botPos.distanceTo(entity.position);
      if (distance > maxRange) continue;
      
      // 如果指定了类型，进行过滤
      if (entityType && entity.name !== entityType && entity.type !== entityType) {
        continue;
      }
      
      entities.push({
        name: entity.name || entity.username || 'unknown',
        type: entity.type,
        displayName: entity.displayName || entity.username || entity.name,
        x: Math.floor(entity.position.x),
        y: Math.floor(entity.position.y),
        z: Math.floor(entity.position.z),
        distance: Math.round(distance * 10) / 10,
        health: entity.health || null,
        isHostile: ['zombie', 'skeleton', 'creeper', 'spider', 'enderman', 'witch', 'phantom'].includes(entity.name),
        isPlayer: entity.type === 'player'
      });
    }
    
    // 按距离排序
    entities.sort((a, b) => a.distance - b.distance);

    // 统计
    const playerCount = entities.filter(e => e.isPlayer).length;
    const hostileCount = entities.filter(e => e.isHostile).length;
    const otherCount = entities.length - playerCount - hostileCount;

    const summary = `Found ${entities.length} entities: ${playerCount} players, ${hostileCount} hostile, ${otherCount} other`;
    
    return {
      success: true,
      message: summary,
      entities: entities,
      stats: {
        total: entities.length,
        players: playerCount,
        hostile: hostileCount,
        other: otherCount
      }
    };
  }

  /**
   * Check if a coordinate is reachable by pathfinding
   * Returns immediately without actually moving
   */
  async canReach(x, y, z) {
    const goal = new goals.GoalBlock(x, y, z);
    
    return new Promise((resolve) => {
      let resolved = false;
      
      const cleanup = () => {
        this.mcBot.removeListener('path_update', onPathUpdate);
      };
      
      const finish = (result) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        this.mcBot.pathfinder.setGoal(null);
        resolve(result);
      };
      
      const onPathUpdate = (results) => {
        if (results.status === 'noPath') {
          finish({
            success: true,
            reachable: false,
            message: `Position (${x}, ${y}, ${z}) is NOT reachable - no path exists`,
            reason: 'noPath'
          });
        } else if (results.status === 'success' || results.path) {
          // 找到路径了
          const pathLength = results.path ? results.path.length : 0;
          const distance = this.mcBot.entity.position.distanceTo(new Vec3(x, y, z));
          finish({
            success: true,
            reachable: true,
            message: `Position (${x}, ${y}, ${z}) is reachable`,
            pathLength: pathLength,
            directDistance: Math.round(distance * 10) / 10
          });
        } else if (results.status === 'timeout') {
          finish({
            success: true,
            reachable: false,
            message: `Cannot determine if (${x}, ${y}, ${z}) is reachable - path calculation timeout`,
            reason: 'timeout'
          });
        }
      };
      
      this.mcBot.on('path_update', onPathUpdate);
      
      // 开始路径计算
      this.mcBot.pathfinder.setGoal(goal);
      
      // 3秒超时（只是检查，不需要太久）
      setTimeout(() => {
        if (resolved) return;
        // 如果3秒内没有收到path_update，可能路径计算中
        const distance = this.mcBot.entity.position.distanceTo(new Vec3(x, y, z));
        if (distance < 2) {
          finish({
            success: true,
            reachable: true,
            message: `Already at position (${x}, ${y}, ${z})`,
            pathLength: 0,
            directDistance: Math.round(distance * 10) / 10
          });
        } else {
          finish({
            success: true,
            reachable: null,  // 未知
            message: `Path calculation still in progress for (${x}, ${y}, ${z})`,
            reason: 'timeout',
            directDistance: Math.round(distance * 10) / 10
          });
        }
      }, 3000);
    });
  }

  /**
   * Calculate and return the path to a coordinate without moving
   */
  async getPathTo(x, y, z) {
    const goal = new goals.GoalBlock(x, y, z);
    
    return new Promise((resolve) => {
      let resolved = false;
      
      const cleanup = () => {
        this.mcBot.removeListener('path_update', onPathUpdate);
      };
      
      const finish = (result) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        this.mcBot.pathfinder.setGoal(null);
        resolve(result);
      };
      
      const onPathUpdate = (results) => {
        if (results.status === 'noPath') {
          finish({
            success: true,
            found: false,
            message: `No path found to (${x}, ${y}, ${z})`,
            reason: 'noPath'
          });
        } else if (results.path && results.path.length > 0) {
          // 转换路径为简单坐标数组
          const pathPoints = results.path.map(node => ({
            x: Math.floor(node.x),
            y: Math.floor(node.y),
            z: Math.floor(node.z)
          }));
          
          const distance = this.mcBot.entity.position.distanceTo(new Vec3(x, y, z));
          
          finish({
            success: true,
            found: true,
            message: `Found path to (${x}, ${y}, ${z}) with ${pathPoints.length} waypoints`,
            pathLength: pathPoints.length,
            directDistance: Math.round(distance * 10) / 10,
            path: pathPoints,
            // 只返回关键点（每隔几个点取一个，避免数据太多）
            keyPoints: pathPoints.filter((_, i) => i % 5 === 0 || i === pathPoints.length - 1)
          });
        } else if (results.status === 'timeout') {
          finish({
            success: true,
            found: false,
            message: `Path calculation timeout for (${x}, ${y}, ${z})`,
            reason: 'timeout'
          });
        }
      };
      
      this.mcBot.on('path_update', onPathUpdate);
      
      // 开始路径计算
      this.mcBot.pathfinder.setGoal(goal);
      
      // 5秒超时
      setTimeout(() => {
        finish({
          success: true,
          found: false,
          message: `Path calculation timeout for (${x}, ${y}, ${z})`,
          reason: 'timeout'
        });
      }, 5000);
    });
  }
}

export default Actions;