import DiffStat from "@components/DiffStat";
import { RequiredRefsParams } from "@lib/params";
import cx from "classnames";
import DiffTableStats from "./DiffTableStats";
import css from "./index.module.css";

type Props = {
  params: RequiredRefsParams & { refName: string };
};

export default function ForWorking(props: Props) {
  return (
    <div className={cx(css.container, css.whiteBg)}>
      <div className={css.openItem}>
        <div className={css.wkOverview}>
          <h1>Working Changes</h1>
          <DiffStat
            {...props}
            params={props.params}
            className={css.wkSummary}
            flat
          />
        </div>
        <DiffTableStats {...props} className={css.wkTables} />
      </div>
    </div>
  );
}
