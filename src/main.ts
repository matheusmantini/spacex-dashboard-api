import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cron from 'node-cron';
import axios from 'axios';
import * as fs from 'fs';
import { MongoClient } from 'mongodb';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  cron.schedule('00 00 09 * * *', async () => {
    const launches = await axios.get(`https://api.spacexdata.com/v5/launches`);

    // store api data in a json file
    fs.writeFile(
      '/home/matheus/Desktop/Test/spacex-dashboard-api/spacex-dashboard-api/src/data/launch-data.json',
      `${JSON.stringify(launches.data)}`,
      function (err) {
        if (err) {
          return console.error(err);
        }
      },
    );

    // mongoDB connection and operations
    const uri =
      'mongodb+srv://matheusmantini:f4e8a6a2@cluster0.3olru4h.mongodb.net/?retryWrites=true&w=majority';
    const client = new MongoClient(uri);
    async function run() {
      try {
        await client.connect();
        const db = client.db('launches');
        const coll = db.collection('launches');

        // get all results from mongoDB
        const launchesList = [];
        const launchesDBId = [];
        await coll.find().forEach((launch) => {
          launchesList.push(launch);
          launchesDBId.push(launch.id);
        });

        // get all results from SpaceX API -> Launches
        const apiLaunches = launches.data;
        const apiLaunchesIds = [];
        const newLaunchesToAdd = [];

        for (let i = 0; i < apiLaunches.length; i++) {
          apiLaunchesIds.push(apiLaunches[i].id);
        }
        const newLaunchesIds = apiLaunchesIds.filter(
          (x) => !launchesDBId.includes(x),
        );

        for (let i = 0; i < apiLaunches.length; i++) {
          for (let j = 0; j < newLaunchesIds.length; j++) {
            if (apiLaunches[i].id === newLaunchesIds[j]) {
              newLaunchesToAdd.push(apiLaunches[i]);
            }
          }
        }

        if (newLaunchesToAdd.length > 0) {
          const insertMongoDbResult = await coll.insertMany(newLaunchesToAdd);
          console.log('insertMongoDbResult', insertMongoDbResult);
        } else {
          console.log('There is no new launches');
        }
      } finally {
        await client.close();
      }
    }
    run().catch(console.dir);

    console.log('cron job is running');
  });

  await app.listen(3001);
}
bootstrap();
