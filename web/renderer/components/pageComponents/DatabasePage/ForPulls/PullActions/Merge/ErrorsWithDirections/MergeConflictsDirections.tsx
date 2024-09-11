import DocsLink from "@components/links/DocsLink";
import { CodeBlock } from "@dolthub/react-components";
import { PullDiffParams } from "@lib/params";
import { getMergeCommands } from "../utils";
import css from "./index.module.css";

type Props = {
  params: PullDiffParams;
};

export default function MergeConflictsDirections({ params }: Props) {
  return (
    <div>
      <h3>Merge and Resolve Conflicts</h3>
      <div className={css.innerModal}>
        <p>
          Conflicts cannot be resolved on the web and must be resolved in a SQL
          shell.
        </p>
        <p>
          <DocsLink path="/sql-reference/version-control/dolt-sql-procedures#dolt_merge">
            Merge
          </DocsLink>{" "}
          pull request:
        </p>
        <CodeBlock.WithCopyButton textToCopy={getMergeCommands(params)} />
        <p>
          View{" "}
          <DocsLink path="/sql-reference/version-control/dolt-system-tables#dolt_conflicts">
            all conflicts
          </DocsLink>
          :
        </p>
        <CodeBlock.WithCopyButton textToCopy="SELECT * FROM dolt_conflicts;" />
        <p>
          View conflicts for{" "}
          <DocsLink path="/sql-reference/version-control/dolt-system-tables#dolt_conflicts_usdtablename">
            each table
          </DocsLink>
          :
        </p>
        <CodeBlock.WithCopyButton textToCopy="SELECT * FROM dolt_conflicts_[tablename];" />
        <p>
          <DocsLink path="/sql-reference/version-control/dolt-sql-procedures#dolt_conflicts_resolve">
            Resolve conflicts
          </DocsLink>
          :
        </p>
        <CodeBlock.WithCopyButton textToCopy="CALL DOLT_CONFLICTS_RESOLVE('--[ours|theirs]', '[tablename]');" />
        <p>
          <DocsLink path="/sql-reference/version-control/dolt-sql-procedures#dolt_commit">
            Commit
          </DocsLink>{" "}
          the merge:
        </p>
        <CodeBlock.WithCopyButton
          textToCopy={`CALL DOLT_COMMIT('-Am', 'Merge branch ${params.fromBranchName}');`}
        />
        <p>
          Learn more about merging and resolving conflicts with SQL{" "}
          <DocsLink path="/sql-reference/version-control/merges">here</DocsLink>
          .
        </p>
      </div>
    </div>
  );
}
