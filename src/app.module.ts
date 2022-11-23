import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LaunchesModule } from './launches/launches.module';

@Module({
  imports: [ConfigModule.forRoot(), LaunchesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
