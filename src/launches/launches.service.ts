import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { MongoClient } from 'mongodb';

@Injectable()
export class LaunchesService {
  // MongoDB
  uri =
    'mongodb+srv://matheusmantini:f4e8a6a2@cluster0.3olru4h.mongodb.net/?retryWrites=true&w=majority';
  client = new MongoClient(this.uri);
  db = this.client.db('launches');
  coll = this.db.collection('launches');

  async findAll() {
    try {
      await this.client.connect();

      // get all results from mongoDB
      const launchesList = [];
      await this.coll.find().forEach((launch) => {
        delete launch._id;
        /* launch['rocket_name'] = rocketsInLaunches.data. */
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
        await this.coll
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
