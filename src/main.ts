import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { dailyCron } from './utils/daily-cron';
import { saveApiDataToDB } from './utils/save-api-data';
import * as swaggerUi from 'swagger-ui-express';
import * as swaggerDocs from './swagger/swagger.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  saveApiDataToDB();

  dailyCron();

  await app.listen(3001);
}
bootstrap();
