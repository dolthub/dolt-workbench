import Button from "@components/Button";
import CodeBlock from "@components/CodeBlock";
import DocsLink from "@components/links/DocsLink";
import Link from "@components/links/Link";
import { RefParams } from "@lib/params";
import { newDoc } from "@lib/urls";
import css from "./index.module.css";

type Props = {
  params: RefParams & {
    tableName?: string;
    docName?: string;
  };
};

export default function NoDocsMsg(props: Props) {
  return (
    <div>
      <h1 className={css.title}>About</h1>
      <h2 className={css.header}>
        {props.params.docName ? `${props.params.docName} not` : "No docs"} found
        for <span className={css.bold}>{props.params.databaseName}.</span>
        <Link {...newDoc(props.params)}>
          <Button>Add doc</Button>
        </Link>
      </h2>
      <div className={css.bottom}>
        <AddFromWorkbench {...props} />
        <AddFromSQL />
      </div>
    </div>
  );
}

function Code(props: { children: string }) {
  return <code className={css.code}>{props.children}</code>;
}

function AddFromWorkbench(props: Props) {
  return (
    <>
      <h3>Adding a doc through the Workbench</h3>
      <p>
        <Link {...newDoc(props.params)}>Click here</Link> to add a doc.
      </p>
    </>
  );
}

function AddFromSQL() {
  return (
    <>
      <h3>Adding a doc using SQL</h3>
      <p>
        Database docs are found in the{" "}
        <DocsLink systemTableType="docs">
          <Code>dolt_docs</Code> system table
        </DocsLink>
        .
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
    </>
  );
}
