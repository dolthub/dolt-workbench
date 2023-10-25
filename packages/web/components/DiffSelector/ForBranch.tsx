import FormSelect from "@components/FormSelect";
import QueryHandler from "@components/util/QueryHandler";
import {
  CommitListForDiffSelectorFragment,
  useCommitsForDiffSelectorQuery,
} from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { diff } from "@lib/urls";
import { useRouter } from "next/router";
import { useState } from "react";
import DiffSelector, { formatCommitShort } from "./component";
import css from "./index.module.css";

type Props = {
  className?: string;
  params: RefParams;
};

type InnerProps = {
  params: RefParams;
  className?: string;
  commits: CommitListForDiffSelectorFragment;
};

function Inner(props: InnerProps) {
  const router = useRouter();
  const [fromCommitId, _setFromCommitId] = useState("");
  const commits = props.commits.list.map(c => {
    return {
      value: c.commitId,
      label: formatCommitShort(c),
    };
  });

  const setFromCommitId = (id?: string) => {
    const diffPaths = diff({ ...props.params, fromCommitId: id });
    router.push(diffPaths.href, diffPaths.as).catch(console.error);
  };

  return (
    <DiffSelector className={props.className}>
      <div data-cy="commit-form-select" className={css.branch}>
        <FormSelect
          val={fromCommitId}
          onChangeValue={setFromCommitId}
          options={commits}
          mono
          light
        />
      </div>
    </DiffSelector>
  );
}

export default function ForBranch({ params, className }: Props) {
  const res = useCommitsForDiffSelectorQuery({ variables: params });
  return (
    <QueryHandler
      result={res}
      render={data => (
        <Inner params={params} commits={data.commits} className={className} />
      )}
    />
  );
}
