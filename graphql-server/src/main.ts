import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import cors from "cors";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.js";
import { AppModule } from "./app.module";

const oneMB = 1024 * 1024;
const maxFileSize = 400 * oneMB;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(graphqlUploadExpress({ maxFileSize, maxFiles: 1 }));
  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      credentials: true,
      origin: true,
    }),
  );
  await app.listen(9002);
}
bootstrap().catch(e => console.error("something went wrong", e));
