import { RefParams } from "@lib/params";
import BranchCommitAndTagSelector from "@components/FormSelectForRefs/BranchCommitAndTagSelector";
import { useState } from "react";
import { BsArrowLeft } from "@react-icons/all-files/bs/BsArrowLeft";
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
      <div className={css.container}>
        <div className={css.top}>
          <div className={css.title}>Pick to revision</div>
          <div className={css.title}>Pick from revision</div>
        </div>
        <div className={css.selectors}>
          <div className={css.branchCommitTag}>
            <BranchCommitAndTagSelector
              params={params}
              selectedValue={toRef}
              onChangeValue={s => setToRef(s || "")}
            />
          </div>
          <div className={css.arrow}>
            <BsArrowLeft />
          </div>
          <div className={css.branchCommitTag}>
            <BranchCommitAndTagSelector
              params={params}
              selectedValue={fromRef}
              onChangeValue={s => setFromRef(s || "")}
            />
          </div>
        </div>
      </div>
      {fromRef && toRef && (
        <Link
          {...diff({
            ...params,
            fromCommitId: fromRef,
            toCommitId: toRef,
          })}
          className={css.viewDiffButton}
        >
          <Button disabled={fromRef === toRef} className={css.button}>
            View Diff
          </Button>
        </Link>
      )}
    </DiffSelector>
  );
}
