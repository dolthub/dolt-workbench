import { RefParams } from "@lib/params";
import BranchCommitAndTagSelector from "@components/FormSelectForRefs/BranchCommitAndTagSelector";
import { useState } from "react";
import Link from "@components/links/Link";
import { diff } from "@lib/urls";
import { Button } from "@dolthub/react-components";
import DiffSelector from "./component";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

export default function ForBranchCommitAndTag({ params }: Props) {
  const [fromRef, setFromRef] = useState("");
  const [toRef, setToRef] = useState("");

  return (
    <DiffSelector>
      <div className={css.branch}>
        <BranchCommitAndTagSelector
          params={params}
          selectedValue={toRef}
          onChangeValue={s => setToRef(s || "")}
        />
      </div>
      <div className={css.branch}>
        <BranchCommitAndTagSelector
          params={params}
          selectedValue={fromRef}
          onChangeValue={s => setFromRef(s || "")}
        />
      </div>
      {fromRef && toRef && fromRef !== toRef && (
        <Link
          {...diff({
            ...params,
            fromCommitId: fromRef,
            toCommitId: toRef,
          })}
          className={css.viewDiffButton}
        >
          <Button>View Diff</Button>
        </Link>
      )}
    </DiffSelector>
  );
}
