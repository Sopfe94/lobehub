import type { LobeChatDatabase } from '../type';
import { getDBInstance } from './web-server';

/**
 * Lazy-load database instance
 * Avoid initializing the database every time the module is imported
 */
let cachedDB: LobeChatDatabase | null = null;

export const getServerDB = async (): Promise<LobeChatDatabase> => {
  // If there's already a cached instance, return it directly
  if (cachedDB) return cachedDB;

  try {
    // Select the appropriate database instance based on the environment
    cachedDB = getDBInstance();
    return cachedDB;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

let serverDBInstance: LobeChatDatabase | null = null;

/**
 * Get the server database instance (lazy-initialized on first access).
 * This avoids initializing the database at module import time, which was causing
 * Next.js build failures when KEY_VAULTS_SECRET was not available during build.
 */
export const getServerDBSync = (): LobeChatDatabase => {
  if (!serverDBInstance) {
    serverDBInstance = getDBInstance();
  }
  return serverDBInstance;
};

/**
 * Lazy getter for serverDB - use this instead of importing serverDB directly
 * @deprecated Use getServerDBSync() instead to be explicit about lazy initialization
 */
export const serverDB = new Proxy({} as LobeChatDatabase, {
  get(target, prop) {
    return getServerDBSync()[prop as keyof LobeChatDatabase];
  },
});
