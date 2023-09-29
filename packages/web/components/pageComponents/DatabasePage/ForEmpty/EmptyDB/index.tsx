import DocsLink from "@components/links/DocsLink";
import CreateTableOptions from "../../CreateTableOptions";
import css from "./index.module.css";

type Props = {
  params: { refName?: string };
};

export default function EmptyDB(props: Props) {
  return (
    <div className={css.empty} data-cy="db-empty-get-started">
      <header>
        <h1>Get Started</h1>
        <p>
          <DocsLink path="/introduction/getting-started">
            View Dolt documentation
          </DocsLink>
        </p>
      </header>
      <div className={css.blueBox}>
        This database is currently empty. Get started below.
      </div>
      <div>
        <div className={css.inner}>
          <h3 className={css.heading}>Create a table</h3>
          <p className={css.details}>
            Create a new table using the SQL Console.
          </p>
          <div>
            <CreateTableOptions params={props.params} getStarted />
          </div>
        </div>
      </div>
    </div>
  );
}
