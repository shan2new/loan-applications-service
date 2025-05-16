import { PrismaClient } from '@prisma/client';
import { singleton } from 'tsyringe';
import { createLogger } from '@shared/logging/logger';

/**
 * Singleton class for managing the Prisma client instance
 */
@singleton()
export class PrismaClientManager {
  private readonly client: PrismaClient;
  private readonly logger = createLogger('PrismaClientManager');

  constructor() {
    this.logger.info('Initializing Prisma client');
    this.client = new PrismaClient({
      log: [
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });

    // We'll initialize the connection in a separate method to avoid async operations in constructor
    this.initialize();

    // Handle process termination
    process.on('beforeExit', async () => {
      await this.disconnect();
    });
  }

  /**
   * Initialize the database connection
   */
  private initialize(): void {
    this.client
      .$connect()
      .then(() => this.logger.info('Connected to database'))
      .catch(err => this.logger.error(err, 'Failed to connect to database'));
  }

  /**
   * Get the Prisma client
   */
  getClient(): PrismaClient {
    return this.client;
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      this.logger.info('Disconnecting from database');
      await this.client.$disconnect();
      this.logger.info('Disconnected from database');
    }
  }
}
