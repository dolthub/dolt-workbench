import Store from "electron-store";

export type StoredAuthor = {
  name: string;
  email: string;
};

const store = new Store<{ commitAuthor?: StoredAuthor }>({
  name: "commit-author",
});

const AUTHOR_KEY = "commitAuthor";

export function getStoredAuthor(): StoredAuthor | null {
  return store.get(AUTHOR_KEY) ?? null;
}

export function setStoredAuthor(author: StoredAuthor): void {
  store.set(AUTHOR_KEY, author);
}