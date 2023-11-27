import { Module } from "@nestjs/common";
import { FileStoreService } from "./fileStore.service";

@Module({ providers: [FileStoreService], exports: [FileStoreService] })
export class FileStoreModule {}
