export interface ActivityLog {
    entityType: string;
    entityId: string | number;
    action: 'POST' | 'PUT' | 'DELETE';
    userId?: string;
    userName?: string;
    recordBefore?: Record<string, any>;
    recordAfter?: Record<string, any>;
    createdAt: Date;
  }
  
  export interface ActivityLoggerPort {
    processAndSendActivityLogMessage(activityLog: ActivityLog): Promise<void>;
    
    // Helper methods for common scenarios
    logCreate(entityType: string, entityId: string | number, recordAfter?: Record<string, any>): Promise<void>;
    logUpdate(entityType: string, entityId: string | number, recordBefore: Record<string, any>, recordAfter: Record<string, any>): Promise<void>;
    logDelete(entityType: string, entityId: string | number,  recordBefore?: Record<string, any>): Promise<void>;
  }