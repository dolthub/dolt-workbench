import DocsLink from "@components/links/DocsLink";
import { CodeBlock } from "@dolthub/react-components";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { PullDiffParams } from "@lib/params";
import css from "./index.module.css";

type Props = {
  params: PullDiffParams;
};

export default function MergeConflictsDirections({ params }: Props) {
  const { getCallProcedure } = useSqlBuilder();
  const checkout = getCallProcedure("DOLT_CHECKOUT", [params.refName]);
  const merge = getCallProcedure("DOLT_MERGE", [params.fromBranchName]);
  const conflictsResolve = getCallProcedure("DOLT_CONFLICTS_RESOLVE", [
    "--[ours|theirs]",
    "[tablename]",
  ]);
  const commit = getCallProcedure("DOLT_COMMIT", [
    "-Am",
    `Merge branch ${params.fromBranchName}`,
  ]);

  return (
    <div>
      <h3>Merge and Resolve Conflicts</h3>
      <div className={css.innerModal}>
        <p>
          If you&apos;d like to manually resolve conflicts before merging,
          follow these steps using the SQL shell.
        </p>
        <p>
          <DocsLink path="/sql-reference/version-control/dolt-sql-procedures#dolt_merge">
            Merge
          </DocsLink>{" "}
          pull request:
        </p>
        <CodeBlock.WithCopyButton textToCopy={`${checkout}\n${merge}`} />
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
        <CodeBlock.WithCopyButton textToCopy={conflictsResolve} />
        <p>
          <DocsLink path="/sql-reference/version-control/dolt-sql-procedures#dolt_commit">
            Commit
          </DocsLink>{" "}
          the merge:
        </p>
        <CodeBlock.WithCopyButton textToCopy={commit} />
        <p>
          Learn more about merging and resolving conflicts with SQL{" "}
          <DocsLink path="/sql-reference/version-control/merges">here</DocsLink>
          .
        </p>
      </div>
    </div>
  );
}
