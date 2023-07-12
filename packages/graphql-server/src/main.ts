import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  if (process.env.NODE_ENV === "development") {
    app.use(
      "/graphql",
      cors<cors.CorsRequest>({
        credentials: true,
        origin: true,
      }),
    );
  }
  await app.listen(9002);
}
bootstrap().catch(e => console.error("something went wrong", e));
