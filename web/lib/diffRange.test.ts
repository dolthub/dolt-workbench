import splitDiffRange from "./diffRange";

describe("test diffRange", () => {
  it("gets split diff range", () => {
    const commit1 = "ewihrjlewjerwwe";
    const commit2 = "lkmopaiwjekjwnn";
    const split = splitDiffRange(`${commit1}...${commit2}`);
    expect(split.fromCommitId).toEqual(commit1);
    expect(split.toCommitId).toEqual(commit2);

    const twoDot = splitDiffRange(`${commit1}..${commit2}`);
    expect(twoDot.fromCommitId).toEqual(commit1);
    expect(twoDot.toCommitId).toEqual(commit2);

    const oneSideSplit = splitDiffRange(`${commit1}...`);
    expect(oneSideSplit.fromCommitId).toEqual(commit1);
    expect(oneSideSplit.toCommitId).toEqual("");
  });
});
