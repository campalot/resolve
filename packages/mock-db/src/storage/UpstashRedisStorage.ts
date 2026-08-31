import { Redis } from "@upstash/redis";

// Initialize using environment variables if they exist (Vercel), otherwise fall back to your local keys
// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });
const redis = Redis.fromEnv();

// Generates a tiny, isolated key per workspace per user session
export const getWorkspaceKey = (sessionId: string, workspaceId: string) => 
  `demo:session:${sessionId}:w:${workspaceId}`;

export const UpstashRedisStorage = {
  // Save only a specific workspace's dataset
  async saveWorkspace(sessionId: string, workspaceId: string, data: any): Promise<void> {
    const key = getWorkspaceKey(sessionId, workspaceId);
    await redis.set(key, data, { ex: 86400 }); // 24-hour expiration
  },

  // Load only a specific workspace's dataset
  async loadWorkspace(sessionId: string, workspaceId: string): Promise<any | null> {
    const key = getWorkspaceKey(sessionId, workspaceId);
    return await redis.get(key);
  },

  async clearWorkspace(sessionId: string, workspaceId: string): Promise<void> {
    const key = getWorkspaceKey(sessionId, workspaceId);
    await redis.del(key);
  }
};

