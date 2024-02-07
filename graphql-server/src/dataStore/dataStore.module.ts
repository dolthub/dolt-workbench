import { Module } from "@nestjs/common";
import { DataStoreService } from "./dataStore.service";

@Module({
  providers: [DataStoreService],
  exports: [DataStoreService],
})
export class DataStoreModule {}
