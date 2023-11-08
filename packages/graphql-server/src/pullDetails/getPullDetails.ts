import { format } from "timeago.js";
import { Commit } from "../commits/commit.model";
import { PullSummary } from "../pullSummaries/pullSummary.model";
import {
  PullDetailCommit,
  PullDetails,
  PullDetailSummary,
  PullDetailUnion,
} from "./pullDetail.model";

type PullDetail = typeof PullDetailUnion;

export default function getPullDetails(summary?: PullSummary): PullDetails {
  const details: PullDetails = [];
  if (!summary) {
    return details;
  }
  // Add commits to details
  summary.commits.list.forEach(c => details.push(getCommit(c)));
  // Get commit summaries from sorted commits
  const sorted = details.sort(sortByTimestampDesc);
  const summaries = getSummaries(sorted);
  return sorted.concat(summaries).sort(sortByTimestampDesc) as PullDetails;
}

function sortByTimestampDesc(a: PullDetail, b: PullDetail) {
  return a.createdAt.valueOf() - b.createdAt.valueOf();
}

function getCommit(c: Commit): PullDetailCommit {
  const parentCommitId = c.parents.length ? c.parents[0] : undefined;
  return {
    ...c,
    username: c.committer.username ?? c.committer.displayName,
    createdAt: c.committedAt,
    parentCommitId,
  };
}

const initialSummary: PullDetailSummary = {
  _id: "",
  username: "",
  createdAt: new Date(0),
  numCommits: 0,
};

function getSummaries(sorted: PullDetail[]): PullDetailSummary[] {
  const summaries: PullDetailSummary[] = [];
  let summary = { ...initialSummary };

  sorted.forEach(d => {
    // Only update summary for commits
    if ("commitId" in d) {
      const timeagosEqual = format(d.createdAt) === format(summary.createdAt);
      const needToUpdate = d.username !== summary.username || !timeagosEqual;

      if (needToUpdate) {
        // Push last summary if it has commit info
        if (summary.numCommits > 0) {
          summaries.push({ ...summary });
        }
        // Update summary with changed information
        summary = {
          ...summary,
          _id: `${d.username}/${d.createdAt.valueOf()}`,
          username: d.username,
          numCommits: 0,
          // Ensure that the summary shows up before first commit
          createdAt: new Date(d.createdAt.valueOf() - 1),
        };
      }
      // Update number of commits every time
      summary.numCommits += 1;
    } else {
      // If not commit, push last summary
      if (summary.numCommits > 0) {
        summaries.push({ ...summary });
      }
      // And start fresh
      summary = { ...initialSummary };
    }
  });

  // If last summary not pushed yet, push
  if (summary.numCommits > 0) {
    summaries.push({ ...summary });
  }

  return summaries;
}
