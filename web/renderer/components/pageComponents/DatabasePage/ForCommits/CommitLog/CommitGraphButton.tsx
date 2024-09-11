import Link from "@components/links/Link";
import { Button } from "@dolthub/react-components";
import { RefParams } from "@lib/params";
import { commitGraph } from "@lib/urls";
import { VscGitCommit } from "@react-icons/all-files/vsc/VscGitCommit";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

export default function CommitGraphButton(props: Props) {
  return (
    <Link {...commitGraph(props.params)}>
      <Button className={css.graphButton}>
        <VscGitCommit />
        Show Commit Graph
      </Button>
    </Link>
  );
}
