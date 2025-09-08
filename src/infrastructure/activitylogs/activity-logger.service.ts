import { Injectable, Logger } from '@nestjs/common';
import { ActivityLoggerPort, ActivityLog } from '../../application/ports/activity-logger.port';

@Injectable()
export class ActivityLoggerService implements ActivityLoggerPort {
  private readonly logger = new Logger(ActivityLoggerService.name);

  async processAndSendActivityLogMessage(activityLog: ActivityLog): Promise<void> {
    try {
      // In a real-world scenario, this could:
      // 1. Send to a message queue (RabbitMQ, AWS SQS, Azure Service Bus)
      // 2. Send to a webhook endpoint
      // 3. Send to Azure Function endpoint
      // 4. Store in a separate logging database
      // 5. Send to monitoring services (DataDog, New Relic, etc.)
      
      // For now, we'll log and demonstrate the structure
      this.logger.log(`Activity Log: ${JSON.stringify(activityLog, null, 2)}`);
      
      // Example: Send to external service (uncomment and configure as needed)
      // await this.sendToExternalService(activityLog);
      
      // Example: Send to message queue (uncomment and configure as needed)
      // await this.sendToMessageQueue(activityLog);
      
    } catch (error) {
      // Don't let logging failures break the main business logic
      this.logger.error(`Failed to process activity log: ${error.message}`, error.stack);
    }
  }

  
  async logCreate(entityType: string, entityId: string | number, recordAfter?: Record<string, any>): Promise<void> {
    const activityLog: ActivityLog = {
      entityType,
      entityId,
      action: 'POST',
      recordAfter,
      createdAt: new Date(),
    };
    
    await this.processAndSendActivityLogMessage(activityLog);
  }

  async logUpdate(entityType: string, entityId: string | number, recordBefore: Record<string, any>, recordAfter: Record<string, any>, userId?: string, userName?: string): Promise<void> {
    const activityLog: ActivityLog = {
      entityType,
      entityId,
      action: 'PUT',
      recordBefore,
      recordAfter,
      createdAt: new Date(),
    };
    
    await this.processAndSendActivityLogMessage(activityLog);
  }

  async logDelete(entityType: string, entityId: string | number, recordBefore?: Record<string, any>): Promise<void> {
    const activityLog: ActivityLog = {
      entityType,
      entityId,
      action: 'DELETE',
      recordBefore,
      createdAt: new Date(),
    };
    
    await this.processAndSendActivityLogMessage(activityLog);
  }

  // Private helper methods for different external integrations
  private async sendToExternalService(activityLog: ActivityLog): Promise<void> {
    // Example implementation for sending to external service (like Azure Function)
    // const response = await fetch(process.env.ACTIVITY_LOG_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(activityLog),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Failed to send activity log: ${response.statusText}`);
    // }
  }

  private async sendToMessageQueue(activityLog: ActivityLog): Promise<void> {
    // Example implementation for message queue
    // await this.messageQueueService.publish('activity-logs', activityLog);
  }
}