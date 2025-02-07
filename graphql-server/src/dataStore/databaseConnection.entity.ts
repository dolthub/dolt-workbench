import { Column, Entity, PrimaryColumn } from "typeorm";
import { DatabaseType } from "../databases/database.enum";

@Entity({ name: "database_connections" })
export class DatabaseConnectionsEntity {
  @PrimaryColumn()
  name: string;

  @Column()
  connectionUrl: string;

  @Column({ nullable: true })
  hideDoltFeatures?: boolean;

  @Column()
  useSSL?: boolean;

  @Column()
  type?: DatabaseType;

  @Column({ nullable: true })
  schema?: string;

  @Column({ nullable: true })
  isLocalDolt?: boolean;
}
