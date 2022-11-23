import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { MongoClient } from 'mongodb';

@Injectable()
export class LaunchesService {
  // MongoDB
  uri =
    'mongodb+srv://matheusmantini:f4e8a6a2@cluster0.3olru4h.mongodb.net/?retryWrites=true&w=majority';
  client = new MongoClient(this.uri);

  async findAll() {
    try {
      await this.client.connect();
      const db = this.client.db('launches');
      const coll = db.collection('launches');

      const rocketsInLaunches = await coll.distinct('rocket');
      console.log('rocketsInLaunches', rocketsInLaunches);

      // get all results from mongoDB
      const launchesList = [];
      await coll.find().forEach((launch) => {
        delete launch._id;
        launchesList.push(launch);
      });

      return launchesList;
    } finally {
      await this.client.close();
    }

    /* const launches = await axios.get(`https://api.spacexdata.com/v5/launches`);

    return launches.data; */
  }

  async findAllPageSearch(search: string, limit: number) {
    try {
      await this.client.connect();
      const db = this.client.db('launches');
      const coll = db.collection('launches');

      const launchesList = [];
      await coll
        .find({
          name: {
            $regex: `(?i)^${search}`,
          },
        })
        .sort({ _id: -1 })
        .limit(+limit)
        .forEach((launch) => {
          delete launch._id;
          launchesList.push(launch);
        });

      const result = {
        results: launchesList,
        totalDocs: launchesList.length,
        page: null,
        totalPages: limit % launchesList.length,
        hasNext: null,
        hasPrev: null,
      };

      return result;
    } finally {
      await this.client.close();
    }

    /* if (search && limit) {
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

      const resultsList = launches.data.docs;
      for (let i = 0; i < resultsList.length; i++) {
        const rocket = await axios.get(
          `https://api.spacexdata.com/v4/rockets/${resultsList[i].rocket}`,
        );
        resultsList[i]['rocket_name'] = rocket.data.name;
      }

      const result = {
        results: resultsList,
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
    } */
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
