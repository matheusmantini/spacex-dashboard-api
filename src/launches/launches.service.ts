import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LaunchesService {
  async findAll() {
    const launches = await axios.get(`https://api.spacexdata.com/v5/launches`);

    return launches.data;
  }

  async findAllPageSearch(search: string, limit: number) {
    if (search && limit) {
      const body = {
        query: {
          name: {
            $regex: `(?i)^${search}`,
          },
        },
        options: {
          pagination: true,
          limit: limit,
        },
      };

      const launches = await axios.post(
        `https://api.spacexdata.com/v5/launches/query?`,
        body,
      );

      const result = {
        results: launches.data.docs,
        totalDocs: launches.data.totalDocs,
        page: launches.data.page,
        totalPages: launches.data.totalPages,
        hasNext: launches.data.hasNextPage,
        hasPrev: launches.data.hasPrevPage,
      };

      return result;
    } else {
      const launches = await axios.get(
        'https://api.spacexdata.com/v5/launches',
      );
      return launches.data;
    }
  }

  async findAllStats() {
    const bodySuccess = {
      query: {
        success: true,
      },
      options: {},
    };

    const bodyFailure = {
      query: {
        success: false,
      },
      options: {},
    };

    const launchesSuccess = await axios.post(
      `https://api.spacexdata.com/v5/launches/query`,
      bodySuccess,
    );

    const launchesFailure = await axios.post(
      `https://api.spacexdata.com/v5/launches/query`,
      bodyFailure,
    );

    return {
      success: launchesSuccess.data.totalDocs,
      failure: launchesFailure.data.totalDocs,
    };
  }
}
