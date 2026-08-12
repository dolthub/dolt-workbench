import { DatabaseSync, StatementSync } from "@dolthub/doltlite";
import * as fs from "fs";

type DriverOptions = {
  readonly?: boolean;
  fileMustExist?: boolean;
};

class DoltLiteStatement {
  private stmt: StatementSync;

  constructor(stmt: StatementSync) {
    this.stmt = stmt;
  }

  get reader(): boolean {
    return this.stmt.columns().length > 0;
  }

  all(...params: unknown[]): unknown[] {
    return this.stmt.all(...params);
  }

  get(...params: unknown[]): unknown {
    return this.stmt.get(...params);
  }

  run(...params: unknown[]): { changes: number; lastInsertRowid: number } {
    return this.stmt.run(...params);
  }
}

class DoltLiteConnection {
  db: DatabaseSync;

  constructor(dbPath: string, options: DriverOptions = {}) {
    if (
      options.fileMustExist &&
      dbPath !== ":memory:" &&
      !fs.existsSync(dbPath)
    ) {
      throw new Error(`Database file does not exist: ${dbPath}`);
    }
    this.db = new DatabaseSync(dbPath, { readOnly: !!options.readonly });
  }

  prepare(sql: string): DoltLiteStatement {
    return new DoltLiteStatement(this.db.prepare(sql));
  }

  // better-sqlite3 API used by TypeORM for connection setup (foreign_keys)
  // and table introspection (table_info, index_list, ...).
  pragma(source: string, options?: { simple?: boolean }): unknown {
    const stmt = new DoltLiteStatement(this.db.prepare(`PRAGMA ${source}`));
    if (!stmt.reader) {
      stmt.run();
      return options?.simple ? undefined : [];
    }
    const rows = stmt.all() as Array<Record<string, unknown>>;
    if (options?.simple) {
      return rows.length ? Object.values(rows[0])[0] : undefined;
    }
    return rows;
  }

  exec(sql: string): void {
    this.db.exec(sql);
  }

  close(): void {
    this.db.close();
  }
}

// TypeORM's better-sqlite3 driver invokes the injected `driver` module as a
// factory function, not with `new`.
export function doltliteDriver(
  dbPath: string,
  options?: DriverOptions,
): DoltLiteConnection {
  return new DoltLiteConnection(dbPath, options);
}
