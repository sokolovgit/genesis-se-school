import { ConfigService } from "@nestjs/config"
import { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

export const createDocument = (app: INestApplication) => {
  const config = app.get(ConfigService)

  const docsPath = config.get<string>("docs.path")

  const options = new DocumentBuilder()
    .setTitle("Weather Forecast API")
    .setDescription("Weather API application that allows users to subscribe to weather updates for their city.")
    .setVersion("1.0")
    .build()

  const document = SwaggerModule.createDocument(app, options)

  SwaggerModule.setup(docsPath, app, document)
}
