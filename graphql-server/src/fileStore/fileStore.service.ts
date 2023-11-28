import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import { resolve } from "path";
import { DatabaseConnection } from "../databases/database.model";

const storePath = resolve(__dirname, "../../store/store.json");

@Injectable()
export class FileStoreService {
  // eslint-disable-next-line class-methods-use-this
  getStore(): DatabaseConnection[] {
    if (!fs.existsSync(storePath)) {
      return [];
    }
    try {
      const file = fs.readFileSync(storePath, {
        encoding: "utf8",
      });
      if (!file) {
        return [];
      }
      const parsed = JSON.parse(file);
      return parsed;
    } catch (err) {
      console.error("Error reading store.json:", err);
      return [];
    }
  }

  addItemToStore(item: DatabaseConnection): void {
    const store = this.getStore();

    const existingItem = store.find(storeItem => storeItem.name === item.name);
    if (existingItem) {
      if (existingItem.connectionUrl === item.connectionUrl) return;
      throw new Error("name already exists");
    }

    store.push(item);

    if (!fs.existsSync(resolve(__dirname, "../../store"))) {
      fs.mkdirSync(resolve(__dirname, "../../store"));
    }

    fs.writeFileSync(storePath, JSON.stringify(store), {
      encoding: "utf8",
    });
  }

  removeItemFromStore(name: string): void {
    const store = this.getStore();
    const newStore = store.filter(item => item.name !== name);
    fs.writeFileSync(storePath, JSON.stringify(newStore), {
      encoding: "utf8",
    });
  }
}
