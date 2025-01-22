import { RefParams } from "@lib/params";
import DiffTableNav from "./component";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

export default function ForRef(props: Props) {
  return (
    <DiffTableNav
      {...props}
      diffStat={
        <p className={css.noDiff} data-cy="diff-layout-no-diff">
          Select revision to view diff
        </p>
      }
      diffTables={null}
    />
  );
}
