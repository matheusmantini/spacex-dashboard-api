import { Controller, Get, Query } from '@nestjs/common';
import { LaunchesService } from './launches.service';

@Controller('launches')
export class LaunchesController {
  constructor(private readonly launchesService: LaunchesService) {}

  @Get()
  findAllWithPageSearch(@Query() query: { search: string; limit: number, page: number }) {
    return this.launchesService.findAllPageSearch(
      query.search,
      query.limit,
      query.page,
    );
  }

  @Get('/stats')
  findAllRocketLaunchAndStats() {
    return this.launchesService.findAllRocketLaunchAndStats();
  }
}
