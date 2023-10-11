import DocsLink from "@components/links/DocsLink";
import css from "./index.module.css";

export default function NoViews() {
  return (
    <p className={css.text} data-cy="db-no-views">
      No saved views. <SchemasDocLink />?
    </p>
  );
}

function SchemasDocLink() {
  return <DocsLink systemTableType="schemas">Add some</DocsLink>;
}
