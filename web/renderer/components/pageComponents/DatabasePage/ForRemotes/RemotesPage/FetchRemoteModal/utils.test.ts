import { getBranchName } from "./utils";

const tests = [
  {
    desc: "remote branch name",
    branchName: "remotes/origin/main",
    expected: {
      branchNameWithRemoteName: "origin/main",
      remoteBranchName: "main",
    },
  },
  {
    desc: "nested remote branch",
    branchName: "remotes/origin/feature/new-feature",
    expected: {
      branchNameWithRemoteName: "origin/feature/new-feature",
      remoteBranchName: "feature/new-feature",
    },
  },
  {
    desc: "remote branch name without remotes prefix",
    branchName: "origin/main",
    expected: {
      branchNameWithRemoteName: "origin/main",
      remoteBranchName: "main",
    },
  },
  {
    desc: "nested remote branch without remotes prefix",
    branchName: "origin/feature/new-feature",
    expected: {
      branchNameWithRemoteName: "origin/feature/new-feature",
      remoteBranchName: "feature/new-feature",
    },
  },
  {
    desc: "empty branch name",
    branchName: "",
    expected: {
      branchNameWithRemoteName: "",
      remoteBranchName: "",
    },
  },
];

describe("test getBranchName", () => {
  tests.forEach(test => {
    it(`should extract ${test.desc} correctly`, () => {
      const result = getBranchName(test.branchName);
      expect(result).toEqual(test.expected);
    });
  });
});
