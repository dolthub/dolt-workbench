import { StatusFragment } from "@gen/graphql-types";
import { getStatusForUncommittedRef } from "./utils";

const status: StatusFragment[] = [
  {
    _id: "working",
    refName: "main",
    tableName: "users",
    staged: false,
    status: "modified",
  },
  {
    _id: "staged",
    refName: "main",
    tableName: "users",
    staged: true,
    status: "modified",
  },
];

describe("getStatusForUncommittedRef", () => {
  test("returns only working changes for the WORKING ref", () => {
    expect(getStatusForUncommittedRef(status, "WORKING")).toEqual([status[0]]);
  });

  test("returns only staged changes for the STAGED ref", () => {
    expect(getStatusForUncommittedRef(status, "STAGED")).toEqual([status[1]]);
  });
});
