import { INestApplication } from '@nestjs/common';
import * as YAML from 'yamljs';
import * as SwaggerUI from 'swagger-ui-express';
import * as path from 'path';

export const createDocument = (app: INestApplication) => {
  const swaggerDocument = YAML.load(
    path.join(process.cwd(), 'public/swagger.yaml'),
  ) as SwaggerUI.JsonObject;

  app.use(
    '/docs',
    SwaggerUI.serve,
    SwaggerUI.setup(swaggerDocument, { explorer: true }),
  );
};
