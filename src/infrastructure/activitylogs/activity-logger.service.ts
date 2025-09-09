import { Injectable, Logger, Inject, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PubSub } from '@google-cloud/pubsub';
import { ActivityLoggerPort, ActivityLog } from '../../application/ports/activity-logger.port';
import { RequestContextService } from '../common/request-context.service';
import { TOKENS } from '../common/tokens';
import * as path from 'path';

@Injectable({ scope: Scope.REQUEST })
export class ActivityLoggerService implements ActivityLoggerPort {
  private readonly logger = new Logger(ActivityLoggerService.name);
  private readonly pubSubClient: PubSub;
  private readonly projectId: string;
  private readonly topicName: string;
  private readonly isEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    @Inject(TOKENS.RequestContextService)
    private readonly requestContext: RequestContextService,
  ) {
    this.projectId = this.configService.get<string>('PUBSUB_PROJECT_ID', '');
    this.topicName = this.configService.get<string>('PUBSUB_TOPIC_ID', '');
    this.isEnabled = this.configService.get<boolean>('ACTIVITY_LOGGING_ENABLED', true);

    // Initialize Pub/Sub client with service account
    if (this.projectId && this.topicName && this.isEnabled) {
      const keyFilename = path.join(process.cwd(), 'gcpconfig.json');
      this.pubSubClient = new PubSub({
        projectId: this.projectId,
        keyFilename: keyFilename,
      });
      this.logger.log(`Pub/Sub client initialized for project: ${this.projectId}, topic: ${this.topicName}`);
    } else {
      this.logger.warn('Pub/Sub not configured properly or disabled. Activity logs will only be logged locally.');
    }
  }

  async processAndSendActivityLogMessage(activityLog: ActivityLog): Promise<void> {
    try {
      // Always log locally first
      this.logger.log(`Activity Log: ${activityLog.action} ${activityLog.entityType}:${activityLog.entityId}`);
      
      // Send to Google Cloud Pub/Sub if configured
      if (this.pubSubClient && this.projectId && this.topicName) {
        await this.publishToPubSub(activityLog);
        this.logger.debug(`Activity log sent to Pub/Sub topic: ${this.topicName}`);
      } else {
        this.logger.debug('Pub/Sub not configured - activity log only logged locally');
      }
      
    } catch (error) {
      // Don't let logging failures break the main business logic
      this.logger.error(`Failed to process activity log: ${error.message}`, error.stack);
    }
  }

  private async publishToPubSub(activityLog: ActivityLog): Promise<void> {
    try {
      const topic = this.pubSubClient.topic(this.topicName);
      
      // Get request metadata for enhanced logging
      const requestMetadata = this.requestContext.getRequestMetadata();
      
      // Enhance activity log with request metadata
      const enhancedActivityLog = {
        ...activityLog,
        requestMetadata
      };
      
      // Convert activity log to JSON string for publishing
      const messageData = JSON.stringify(enhancedActivityLog);
      const dataBuffer = Buffer.from(messageData);
      
      // Add metadata attributes for easier filtering and routing
      const attributes: Record<string, string> = {
        entityType: activityLog.entityType,
        action: activityLog.action,
        entityId: activityLog.entityId.toString(),
        timestamp: activityLog.createdAt.toISOString(),
      };
      
      // Add optional attributes if they exist
      if (activityLog.userId) {
        attributes['userId'] = activityLog.userId;
      }
      
      if (activityLog.userName) {
        attributes['userName'] = activityLog.userName;
      }
      
      
      if (requestMetadata.method) {
        attributes['httpMethod'] = requestMetadata.method;
      }
      
      // Publish the message
      const messageId = await topic.publishMessage({
        data: dataBuffer,
        attributes: attributes,
      });
      
      this.logger.debug(`Message ${messageId} published to topic ${this.topicName}`);
      
    } catch (error) {
      this.logger.error(`Failed to publish to Pub/Sub: ${error.message}`, error.stack);
      throw error; // Re-throw to be caught by the main error handler
    }
  }

  
  async logCreate(entityType: string, entityId: string | number, recordAfter?: Record<string, any>): Promise<void> {
    const activityLog: ActivityLog = {
      entityType,
      entityId,
      action: 'POST',
      userId: this.requestContext.userId,
      userName: this.requestContext.userName,
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
      userId: userId ?? this.requestContext.userId,
      userName: userName ?? this.requestContext.userName,
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
      userId: this.requestContext.userId,
      userName: this.requestContext.userName,
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