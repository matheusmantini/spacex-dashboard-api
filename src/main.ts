import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { dailyCron } from './utils/daily-cron';
import { saveApiDataToDB } from './utils/save-api-data';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  saveApiDataToDB();

  dailyCron();

  await app.listen(3001);
}
bootstrap();
