import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LaunchesService {
  async findAll() {
    const launches = await axios.get(`https://api.spacexdata.com/v5/launches`);

    return launches.data;
  }

  async findAllPageSearch(search:string, limit:number) {

    const body = {
      "query":{
        "name": {
          "$regex": `(?i)^${search}`
        }
      },
      "options":{
         "pagination": true,
          "limit": limit
      }
   }

    const launches = await axios.post(
      `https://api.spacexdata.com/v5/launches/query?`,
      body,
    );

    return launches.data;
  }
}
