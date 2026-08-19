import { ConnectionProvider } from "./connection.provider";

describe("ConnectionProvider.closeConnection", () => {
  it("destroys its query factory and data source", async () => {
    const provider = new ConnectionProvider();
    const destroyQueryFactory = jest.fn();
    const destroyDataSource = jest.fn();

    Object.assign(provider, {
      qf: { destroy: destroyQueryFactory },
      ds: { isInitialized: true, destroy: destroyDataSource },
      workbenchConfig: { name: "/tmp/clone.db" },
    });

    await provider.closeConnection();

    expect(destroyQueryFactory).toHaveBeenCalledTimes(1);
    expect(destroyDataSource).toHaveBeenCalledTimes(1);
    expect(provider.getWorkbenchConfig()).toBeUndefined();
    expect(() => provider.connection()).toThrow(
      "Data source service not initialized",
    );
  });
});
