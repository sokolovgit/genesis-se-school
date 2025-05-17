import { INestApplication } from '@nestjs/common';
import * as YAML from 'yamljs';
import * as SwaggerUI from 'swagger-ui-express';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

export const createDocument = (app: INestApplication) => {
  const config = app.get(ConfigService);

  const docsPath = config.get<string>('docs.path');

  const swaggerDocument = YAML.load(
    path.join(process.cwd(), 'public/swagger.yaml'),
  ) as SwaggerUI.JsonObject;

  app.use(
    `/${docsPath}`,
    SwaggerUI.serve,
    SwaggerUI.setup(swaggerDocument, { explorer: true }),
  );
};
