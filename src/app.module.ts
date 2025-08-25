import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BeatsModule } from './beats/beats.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import path from 'path';
import { BeatsController } from './beats/beats.controller'; 

@Module({
  imports: [BeatsModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    // configure middleware here if needed

    // Options to apply middleware
    // 1. forRoutes('path')
    consumer.apply(LoggerMiddleware).forRoutes('beats');

    // 2. forRoutes({path: 'path', method: RequestMethod.GET})
    // consumer.apply(LoggerMiddleware).forRoutes({path: 'beats', method:RequestMethod.POST});

    // 3. forRoutes(Controller)
    // consumer.apply(LoggerMiddleware).forRoutes(BeatsController);
  }
}
