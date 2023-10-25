import { params, tableCols } from "./mocks";
import { getDoltCommitDiffQuery } from "./utils";

describe("test getDoltCommitDiffQuery for diff tables", () => {
  it("returns query for no diff tags or removed columns", () => {
    expect(
      getDoltCommitDiffQuery({
        params,
        columns: tableCols,
        hiddenColIndexes: [],
      }),
    ).toEqual(
      `SELECT diff_type, \`from_id\`, \`to_id\`, \`from_name\`, \`to_name\`, from_commit, from_commit_date, to_commit, to_commit_date FROM \`dolt_commit_diff_${params.tableName}\` WHERE from_commit="${params.fromCommitId}" AND to_commit="${params.toCommitId}"`,
    );
  });

  it("returns query for no diff tags and removed columns", () => {
    expect(
      getDoltCommitDiffQuery({
        params,
        columns: tableCols,
        hiddenColIndexes: [1],
      }),
    ).toEqual(
      `SELECT diff_type, \`from_id\`, \`to_id\`, from_commit, from_commit_date, to_commit, to_commit_date FROM \`dolt_commit_diff_${params.tableName}\` WHERE from_commit="${params.fromCommitId}" AND to_commit="${params.toCommitId}"`,
    );
  });
});
