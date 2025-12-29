import mineflayer from 'mineflayer';
import pathfinderPkg from 'mineflayer-pathfinder';
const { pathfinder, Movements } = pathfinderPkg;
import minecraftData from 'minecraft-data';
import { config } from './config.js';

/**
 * Minecraft Bot wrapper class
 * Handles connection and provides interface for actions
 */
export class Bot {
  constructor() {
    this.bot = null;
    this.isConnected = false;
  }

  /**
   * Connect to Minecraft server
   * @returns {Promise<void>}
   */
  async connect() {
    return new Promise((resolve, reject) => {
      console.log(`[Bot] Connecting to ${config.minecraft.host}:${config.minecraft.port}...`);
      
      this.bot = mineflayer.createBot({
        host: config.minecraft.host,
        port: config.minecraft.port,
        username: config.minecraft.username,
        version: config.minecraft.version,
      });

      // Load pathfinder plugin
      this.bot.loadPlugin(pathfinder);

      this.bot.once('spawn', () => {
        console.log('[Bot] Successfully spawned in game!');
        this.isConnected = true;
        
        // Setup pathfinder
        const mcData = minecraftData(this.bot.version);
        const movements = new Movements(this.bot, mcData);
        this.bot.pathfinder.setMovements(movements);
        
        resolve();
      });

      this.bot.on('error', (err) => {
        console.error('[Bot] Error:', err);
        reject(err);
      });

      this.bot.on('end', () => {
        console.log('[Bot] Disconnected from server');
        this.isConnected = false;
      });

      this.bot.on('kicked', (reason) => {
        console.log('[Bot] Kicked from server:', reason);
        this.isConnected = false;
      });

      // Chat message handler
      this.bot.on('chat', (username, message) => {
        if (username === this.bot.username) return;
        console.log(`[Chat] <${username}> ${message}`);
      });
    });
  }

  /**
   * Send a chat message
   * @param {string} message 
   */
  chat(message) {
    if (this.bot) {
      this.bot.chat(message);
    }
  }

  /**
   * Get bot's current position
   * @returns {{x: number, y: number, z: number} | null}
   */
  getPosition() {
    if (!this.bot || !this.bot.entity) return null;
    const pos = this.bot.entity.position;
    return {
      x: Math.floor(pos.x),
      y: Math.floor(pos.y),
      z: Math.floor(pos.z),
    };
  }

  /**
   * Get bot's health and hunger
   * @returns {{health: number, food: number} | null}
   */
  getHealth() {
    if (!this.bot) return null;
    return {
      health: this.bot.health,
      food: this.bot.food,
    };
  }

  /**
   * Get nearby entities
   * @param {number} range 
   * @returns {Array}
   */
  getNearbyEntities(range = 16) {
    if (!this.bot) return [];
    const entities = [];
    for (const entity of Object.values(this.bot.entities)) {
      if (entity === this.bot.entity) continue;
      const distance = this.bot.entity.position.distanceTo(entity.position);
      if (distance <= range) {
        entities.push({
          type: entity.type,
          name: entity.name || entity.username || entity.displayName || 'unknown',
          distance: Math.round(distance * 10) / 10,
          position: {
            x: Math.floor(entity.position.x),
            y: Math.floor(entity.position.y),
            z: Math.floor(entity.position.z),
          },
        });
      }
    }
    return entities;
  }

  /**
   * Get inventory items
   * @returns {Array}
   */
  getInventory() {
    if (!this.bot) return [];
    return this.bot.inventory.items().map(item => ({
      name: item.name,
      count: item.count,
      slot: item.slot,
    }));
  }

  /**
   * Get the underlying mineflayer bot instance
   * @returns {mineflayer.Bot}
   */
  getMineflayerBot() {
    return this.bot;
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.bot) {
      this.bot.quit();
      this.bot = null;
      this.isConnected = false;
    }
  }
}

export default Bot;