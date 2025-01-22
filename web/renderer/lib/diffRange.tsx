type Commits = {
  fromCommitId: string;
  toCommitId: string;
};

export default function splitDiffRange(diffRange: string): Commits {
  const [fromCommitId, toCommitId] = diffRange.split(/\.{2,}/);
  return { fromCommitId, toCommitId };
}
