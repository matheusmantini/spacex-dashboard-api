import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LaunchesModule } from './launches/launches.module';

@Module({
  imports: [LaunchesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
