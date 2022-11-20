import { Module } from '@nestjs/common';
import { LaunchesService } from './launches.service';
import { LaunchesController } from './launches.controller';

@Module({
  controllers: [LaunchesController],
  providers: [LaunchesService]
})
export class LaunchesModule {}
