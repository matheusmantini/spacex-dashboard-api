import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateLaunchDto } from './dto/create-launch.dto';
import { UpdateLaunchDto } from './dto/update-launch.dto';
import { Launch } from './entities/launch.entity';

@Injectable()
export class LaunchesService {
  async findAll() {
    const launches = await axios.get(`https://api.spacexdata.com/v5/launches`);

    return launches.data;
  }

  async findAllPageSearch(body: Launch, search:string, limit:string) {
    const launches = await axios.post(
      `https://api.spacexdata.com/v5/launches/query?`,
      body,
    );

    return launches.data;
  }
}
