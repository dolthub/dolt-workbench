import { fromStatusRows } from "./status.model";

describe("fromStatusRows", () => {
  test("gives staged and working statuses for the same table unique IDs", () => {
    const statuses = fromStatusRows(
      [
        { table_name: "users", staged: 0, status: "modified" },
        { table_name: "users", staged: 1, status: "modified" },
      ],
      "my_database",
      "main",
    );

    expect(statuses).toEqual([
      {
        _id: "databases/my_database/refs/main/status/users/working",
        refName: "main",
        tableName: "users",
        staged: false,
        status: "modified",
      },
      {
        _id: "databases/my_database/refs/main/status/users/staged",
        refName: "main",
        tableName: "users",
        staged: true,
        status: "modified",
      },
    ]);
  });
});
