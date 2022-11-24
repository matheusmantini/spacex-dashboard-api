import { BadRequestException, Injectable } from '@nestjs/common';
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
        launch['year'] = launch.date_utc.slice(0, 4);

        launchesList.push(launch);
      });

      return launchesList;
    } finally {
      await this.client.close();
    }
  }

  async findAllPageSearch(search: string, limit: number, page: number) {
    if (search && limit) {
      try {
        await this.client.connect();

        const launchesListPerPage = [];
        const totalLaunches = [];
        const rocketsList = [];

        await this.collRockets.find().forEach((rocket) => {
          delete rocket._id;
          rocketsList.push(rocket);
        });

        await this.collLaunches
          .find({
            name: {
              $regex: `(?i)^${search}`,
            },
          })
          .forEach((launch) => {
            delete launch._id;

            const rocketInfo = rocketsList.find(
              ({ id }) => id === launch.rocket,
            );
            launch['rocket_name'] = rocketInfo.name;

            totalLaunches.push(launch);
          });

        const totalDocs = totalLaunches.length;
        let pageValue = +page || 1;
        const totalPages = Math.ceil(totalLaunches.length / limit);
        const hasNext = totalPages - +page > 0 ? true : false;
        const hasPrev = +page - 1 === 0 ? false : true;

        if (+page === 0 || page > totalPages) {
          throw new BadRequestException('A página informada não existe');
        }

        await this.collLaunches
          .find({
            name: {
              $regex: `(?i)^${search}`,
            },
          })
          .sort({ _id: -1 })
          .skip(+limit * pageValue - +limit)
          .limit(+limit)
          .forEach((launch) => {
            delete launch._id;

            const rocketInfo = rocketsList.find(
              ({ id }) => id === launch.rocket,
            );

            launch['rocket_name'] = rocketInfo.name;
            launch['year'] = launch.date_utc.slice(0, 4);
            launchesListPerPage.push(launch);
          });

        return {
          results: launchesListPerPage,
          totalDocs: totalDocs,
          page: pageValue,
          totalPages: totalPages,
          hasNext: hasNext,
          hasPrev: hasPrev,
        };
      } finally {
        await this.client.close();
      }
    } else {
      return this.findAll();
    }
  }

  async findAllRocketLaunchAndStats() {
    const allLaunches = await this.findAll();

    let rocketsLaunch = [];
    let rocketsLaunchByYear = [];
    let rocketsLaunchResult = {};
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < allLaunches.length; i++) {
      if (allLaunches[i].success !== null) {
        rocketsLaunch.push(allLaunches[i].rocket_name);
        rocketsLaunchByYear.push({
          rocket: allLaunches[i].rocket_name,
          year: allLaunches[i].year,
        });
        allLaunches[i].success === true
          ? (successCount += 1)
          : (failureCount += 1);
      }
    }
    rocketsLaunch.forEach((element) => {
      rocketsLaunchResult[element] = (rocketsLaunchResult[element] || 0) + 1;
    });

    const rocketsLaunchByYearResult = Object.values(
      rocketsLaunchByYear.reduce((r, e) => {
        let k = `${e.rocket}|${e.year}`;
        if (!r[k]) r[k] = { ...e, count: 1 };
        else r[k].count += 1;
        return r;
      }, {}),
    );

    rocketsLaunchResult['success'] = successCount;
    rocketsLaunchResult['failure'] = failureCount;
    rocketsLaunchResult['launch_by_year'] = rocketsLaunchByYearResult;

    return rocketsLaunchResult;
  }
}
