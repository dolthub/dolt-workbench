import Button from "@components/Button";
import CodeBlock from "@components/CodeBlock";
import DocsLink from "@components/links/DocsLink";
import Link from "@components/links/Link";
import { DatabaseParams } from "@lib/params";
import { defaultDoc, newDoc } from "@lib/urls";
import DatabasePage from "../component";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams & {
    refName?: string;
    tableName?: string;
    docName?: string;
  };
  title?: string;
};

export default function NoDocsMsg(props: Props) {
  const doltDocsText = `CREATE TABLE \`dolt_docs\` (
  \`doc_name\` varchar(16383) NOT NULL,
  \`doc_text\` varchar(16383),
  PRIMARY KEY (\`doc_name\`)
);`;
  return (
    <DatabasePage
      {...props}
      initialTabIndex={1}
      leftNavInitiallyOpen
      routeRefChangeTo={defaultDoc}
    >
      <div data-cy="no-docs-msg">
        <h1 className={css.title}>About</h1>
        <h2 className={css.header} data-cy="no-docs-found">
          {props.params.docName ? `${props.params.docName} not` : "No docs"}{" "}
          found for{" "}
          <span className={css.bold}>{props.params.databaseName}.</span>
          {props.params.refName && (
            <>
              <span
                className={css.addDocOnDesktop}
                data-cy="add-docs-on-desktop"
              >
                , visit this page on desktop to add a doc
              </span>
              <Link
                {...newDoc({
                  ...props.params,
                  refName: props.params.refName,
                })}
              >
                <Button data-cy="add-doc-button">Add doc</Button>
              </Link>
            </>
          )}
        </h2>
        <div className={css.bottom} data-cy="add-docs-instructions">
          {props.params.refName && (
            <>
              <h3 data-cy="adding-doc-title">
                Adding a doc through the Workbench
              </h3>
              <p>
                <Link
                  {...newDoc({
                    ...props.params,
                    refName: props.params.refName,
                  })}
                >
                  Click here
                </Link>{" "}
                to add a doc.
              </p>
            </>
          )}
          <h3>Adding a doc using SQL</h3>
          <p>
            Database docs are found in the{" "}
            <DocsLink systemTableType="docs">
              <Code>dolt_docs</Code> system table
            </DocsLink>
            .
          </p>
          <p>
            If the <Code>dolt_docs</Code> table doesn&apos;t already exist,
            first create it:
          </p>
          <p>
            <CodeBlock.WithCopyButton textToCopy={doltDocsText} />
          </p>
          <p>
            To create a <Code>README.md</Code> use query:
          </p>
          <p>
            <CodeBlock.WithCopyButton
              textToCopy={`INSERT INTO dolt_docs VALUES ("README.md", "[your readme text]");`}
            />
          </p>
          <p>
            To create a <Code>LICENSE.md</Code> use query:
          </p>
          <p>
            <CodeBlock.WithCopyButton
              textToCopy={`INSERT INTO dolt_docs VALUES ("LICENSE.md", "[your license text]");`}
            />
          </p>
          <p>
            Once you are satisfied with your changes, you can commit the docs,
            similar to how you would a table:
          </p>
          <p>
            <CodeBlock.WithCopyButton
              textToCopy={`CALL DOLT_COMMIT("-am", "Add docs");`}
            />
          </p>
        </div>
      </div>
    </DatabasePage>
  );
}

function Code(props: { children: string }) {
  return <code className={css.code}>{props.children}</code>;
}
