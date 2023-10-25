type Commits = {
  fromCommitId: string;
  toCommitId: string;
};

export default function splitDiffRange(diffRange: string): Commits {
  const [fromCommitId, toCommitId] = diffRange.split(/\.+/);
  return { fromCommitId, toCommitId };
}
