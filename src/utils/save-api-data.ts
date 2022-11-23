import axios from 'axios';
import * as fs from 'fs';
import { MongoClient } from 'mongodb';
import * as apiData from '../data/launch-data.json';

export const saveApiDataToJson = async () => {
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
};
