import { Module } from "@nestjs/common";
import { DataSourceService } from "./dataSource.service";

@Module({
  providers: [
    {
      provide: DataSourceService,
      useValue: new DataSourceService(undefined),
    },
  ],
  exports: [DataSourceService],
})
export class DataSourceModule {}
