declare const handler: {
  send(channel: string, value: unknown): void;
  on(channel: string, callback: (...args: unknown[]) => void): () => void;
  invoke(channel: string, ...args: unknown[]): Promise<any>;
};
export type IpcHandler = typeof handler;
export {};
