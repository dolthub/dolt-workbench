import Button from "@components/Button";
import Link from "@components/links/Link";
import { RefParams } from "@lib/params";
import { commitLog } from "@lib/urls";
import { TiFlowChildren } from "@react-icons/all-files/ti/TiFlowChildren";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

export default function CommitLogButton(props: Props) {
  return (
    <Link {...commitLog(props.params)}>
      <Button className={css.button} data-cy="commits-graph-button">
        <TiFlowChildren />
        Show Commit Log
      </Button>
    </Link>
  );
}
