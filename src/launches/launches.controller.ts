import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LaunchesService } from './launches.service';
import { CreateLaunchDto } from './dto/create-launch.dto';
import { UpdateLaunchDto } from './dto/update-launch.dto';
import { Launch } from './entities/launch.entity';

@Controller('launches')
export class LaunchesController {
  constructor(private readonly launchesService: LaunchesService) {}

  @Get()
  findAll() {
    return this.launchesService.findAll();
  }

  @Post()
  findAllPageSearch(
    @Param('search') search: string,
    @Param('limit') limit: string,
    @Body()
    body: Launch,
  ) {
    body.query.name.$regex = `(?i)^${search}`;
    body.options.limit = +`${limit}`;

    console.log("SEARCH", search);
    console.log("LIMIT", limit);

    console.log("BODY",body);
    return this.launchesService.findAllPageSearch(body,search.limit);
  }
}
