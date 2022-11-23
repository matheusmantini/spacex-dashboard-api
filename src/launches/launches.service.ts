import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class LaunchesService {
  // MongoDB
  uri =
    'mongodb+srv://matheusmantini:f4e8a6a2@cluster0.3olru4h.mongodb.net/?retryWrites=true&w=majority';
  client = new MongoClient(this.uri);
  db = this.client.db('launches');
  collLaunches = this.db.collection('launches');
  collRockets = this.db.collection('rockets');

  async findAll() {
    try {
      await this.client.connect();

      // get all results from mongoDB
      const rocketsList = [];
      await this.collRockets.find().forEach((rocket) => {
        delete rocket._id;
        rocketsList.push(rocket);
      });

      const launchesList = [];
      await this.collLaunches.find().forEach((launch) => {
        delete launch._id;

        const rocketInfo = rocketsList.find(({ id }) => id === launch.rocket);
        launch['rocket_name'] = rocketInfo.name;

        launchesList.push(launch);
      });

      return launchesList;
    } finally {
      await this.client.close();
    }
  }

  async findAllPageSearch(search: string, limit: number) {
    if (search && limit) {
      try {
        await this.client.connect();

        const launchesList = [];
        await this.collLaunches
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
    } else {
      return this.findAll();
    }
  }

  async findAllStats() {}
}
