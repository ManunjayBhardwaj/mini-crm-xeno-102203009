import Redis from 'ioredis';
import { EventEmitter } from 'events';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const eventEmitter = new EventEmitter();

// Queue names
const QUEUES = {
  CAMPAIGN_DELIVERY: 'campaign:delivery',
  MESSAGE_DELIVERY: 'message:delivery',
  DELIVERY_RECEIPT: 'delivery:receipt'
};

// Message status
export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

interface QueueMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

class MessageQueue {
  private static instance: MessageQueue;

  private constructor() {
    this.setupSubscriptions();
  }

  public static getInstance(): MessageQueue {
    if (!MessageQueue.instance) {
      MessageQueue.instance = new MessageQueue();
    }
    return MessageQueue.instance;
  }

  private async setupSubscriptions() {
    const subscriber = redis.duplicate();

    // ✅ Spread the values so each queue is passed as a separate argument
    await subscriber.subscribe(...Object.values(QUEUES));

    subscriber.on('message', (channel, message) => {
      try {
        const parsedMessage: QueueMessage = JSON.parse(message);
        eventEmitter.emit(channel, parsedMessage);
      } catch (err) {
        console.error(`Failed to parse message from ${channel}:`, err);
      }
    });
  }

  public async enqueue(queue: string, data: any): Promise<string> {
    const message: QueueMessage = {
      id: `${queue}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      type: queue,
      data,
      timestamp: Date.now()
    };

    await redis.rpush(queue, JSON.stringify(message));
    await redis.publish(queue, JSON.stringify(message));
    
    return message.id;
  }

  public async dequeue(queue: string): Promise<QueueMessage | null> {
    const message = await redis.lpop(queue);
    return message ? JSON.parse(message) : null;
  }

  public onMessage(queue: string, callback: (message: QueueMessage) => void) {
    eventEmitter.on(queue, callback);
  }

  public async getQueueLength(queue: string): Promise<number> {
    return await redis.llen(queue);
  }
}

export const messageQueue = MessageQueue.getInstance();
export { QUEUES };
