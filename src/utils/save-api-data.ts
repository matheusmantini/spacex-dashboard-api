import axios from 'axios';
import { MongoClient } from 'mongodb';

export const saveApiDataToDB = async () => {
  const launchesApi = await axios.get(`https://api.spacexdata.com/v5/launches`);
  const rocketsApi = await axios.get(`https://api.spacexdata.com/v4/rockets`);

  // mongoDB connection
  const uri =
    'mongodb+srv://matheusmantini:f4e8a6a2@cluster0.3olru4h.mongodb.net/?retryWrites=true&w=majority';
  const clientLaunches = new MongoClient(uri);
  const clientRockets = new MongoClient(uri);

  // operations in mongoDB Database Rockets
  async function runDBLaunches() {
    try {
      await clientLaunches.connect();
      const db = clientLaunches.db('launches');
      const coll = db.collection('launches');

      // get all results from mongoDB
      const launchesList = [];
      const launchesDBId = [];
      await coll.find().forEach((launch) => {
        launchesList.push(launch);
        launchesDBId.push(launch.id);
      });

      // get all results from SpaceX API -> Launches
      const apiLaunches = launchesApi.data;
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
        await coll.insertMany(newLaunchesToAdd);
      }
    } finally {
      await clientLaunches.close();
    }
  }
  runDBLaunches().catch(console.dir);

  // operations in mongoDB Database Rockets
  async function runDBRockets() {
    try {
      await clientRockets.connect();
      const db = clientRockets.db('launches');
      const coll = db.collection('rockets');

      // get all results from mongoDB
      const rocketsList = [];
      const rocketsDBId = [];
      await coll.find().forEach((rockets) => {
        rocketsList.push(rockets);
        rocketsDBId.push(rockets.id);
      });

      // get all results from SpaceX API -> Rockets
      const apiRockets = rocketsApi.data;
      const apiRocketsIds = [];
      const newRocketsToAdd = [];

      for (let i = 0; i < apiRockets.length; i++) {
        apiRocketsIds.push(apiRockets[i].id);
      }
      const newRocketsIds = apiRocketsIds.filter(
        (x) => !rocketsDBId.includes(x),
      );

      for (let i = 0; i < apiRockets.length; i++) {
        for (let j = 0; j < newRocketsIds.length; j++) {
          if (apiRockets[i].id === newRocketsIds[j]) {
            newRocketsToAdd.push(apiRockets[i]);
          }
        }
      }

      if (newRocketsToAdd.length > 0) {
        await coll.insertMany(newRocketsToAdd);
      }
    } finally {
      await clientRockets.close();
    }
  }
  runDBRockets().catch(console.dir);
};
