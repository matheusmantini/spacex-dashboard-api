import { BadRequestException, Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_URI } from 'src/env';

@Injectable()
export class LaunchesService {
  // MongoDB
  client = new MongoClient(MONGO_URI);
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

        if (
          launch.cores[0].reused === true &&
          launch.rocket === '5e9d0d95eda69973a809d1ec'
        ) {
          launch['rocket_name'] = `Used ${rocketInfo.name}`;
        } else if (
          launch.cores[0].reused === false &&
          launch.rocket === '5e9d0d95eda69973a809d1ec'
        ) {
          launch['rocket_name'] = `New ${rocketInfo.name}`;
        } else {
          launch['rocket_name'] = rocketInfo.name;
        }

        if (launch.success === true) {
          launch['status'] = 'success';
        } else if (launch.success === false) {
          launch['status'] = 'failure';
        } else {
          launch['status'] = 'none';
        }

        launch['year'] = launch.date_utc.slice(0, 4);

        launchesList.push(launch);
      });

      return launchesList;
    } catch (error) {
      await this.client.close();
      throw new Error(error);
    }
  }

  async findAllPageSearch(search: string, limit: number, page: number) {
    if ((search && limit && page) || (limit && page)) {
      try {
        await this.client.connect();

        const launchesListPerPage = [];
        const totalLaunches = [];
        const rocketsList = [];
        const findWithNoSearch = {};
        const findWithSearch = {
          name: {
            $regex: `(?i)^${search}`,
          }
        };

        await this.collRockets.find().forEach((rocket) => {
          delete rocket._id;
          rocketsList.push(rocket);
        });

        await this.collLaunches
          .find(search ? findWithSearch : findWithNoSearch)
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
          return [];
        }

        await this.collLaunches
          .find(search ? findWithSearch : findWithNoSearch)
          .sort({ _id: -1 })
          .skip(+limit * pageValue - +limit)
          .limit(+limit)
          .forEach((launch) => {
            delete launch._id;

            const rocketInfo = rocketsList.find(
              ({ id }) => id === launch.rocket,
            );

            if (
              launch.cores[0].reused === true &&
              launch.rocket === '5e9d0d95eda69973a809d1ec'
            ) {
              launch['rocket_name'] = `Used ${rocketInfo.name}`;
            } else if (
              launch.cores[0].reused === false &&
              launch.rocket === '5e9d0d95eda69973a809d1ec'
            ) {
              launch['rocket_name'] = `New ${rocketInfo.name}`;
            } else {
              launch['rocket_name'] = rocketInfo.name;
            }

            if (launch.success === true) {
              launch['status'] = 'success';
            } else if (launch.success === false) {
              launch['status'] = 'failure';
            } else {
              launch['status'] = 'none';
            }

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
      } catch (error) {
        await this.client.close();
        throw new Error(error);
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
      rocketsLaunchByYear.reduce((acc, cur) => {
        let rocket = `${cur.rocket}|${cur.year}`;
        if (!acc[rocket]) acc[rocket] = { ...cur, count: 1 };
        else acc[rocket].count += 1;
        return acc;
      }, {}),
    );

    rocketsLaunchResult['success'] = successCount;
    rocketsLaunchResult['failure'] = failureCount;
    rocketsLaunchResult['launch_by_year'] = rocketsLaunchByYearResult;

    return rocketsLaunchResult;
  }
}
