import * as cron from 'node-cron';
import axios from 'axios';
import { MongoClient } from 'mongodb';

export const dailyCron = () => {
  cron.schedule('00 00 09 * * *', async () => {
    const launches = await axios.get(`https://api.spacexdata.com/v5/launches`);

    // mongoDB connection
    const uri =
      'mongodb+srv://matheusmantini:f4e8a6a2@cluster0.3olru4h.mongodb.net/?retryWrites=true&w=majority';
    const client = new MongoClient(uri);

    // operations in mongoDB
    async function runDB() {
      try {
        await client.connect();
        const db = client.db('launches');
        const coll = db.collection('launches');

        const rocketsInLaunches = await coll.distinct('rocket');
        console.log('rocketsInLaunches', rocketsInLaunches);

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
    runDB().catch(console.dir);

    console.log('cron job is running');
  });
};
