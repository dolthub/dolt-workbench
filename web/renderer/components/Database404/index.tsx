import Page404 from "@components/Page404";
import Page from "@components/util/Page";
import { DatabaseLayoutWrapperOuter } from "@layouts/DatabaseLayout/Wrapper";
import { DatabaseParams } from "@lib/params";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
};

export default function Database404Page(props: Props) {
  return (
    <Page title="404 - Database not found">
      <Database404 {...props} />
    </Page>
  );
}

export function Database404(props: Props) {
  return (
    <DatabaseLayoutWrapperOuter params={props.params}>
      <Page404 title="Database not found">
        <Database404Inner {...props} />
      </Page404>
    </DatabaseLayoutWrapperOuter>
  );
}

export function Database404Inner(props: Props) {
  return (
    <div className={css.db404}>
      <p className={css.message}>
        We couldn&apos;t find a database named{" "}
        <code>{props.params.databaseName}</code>.
      </p>
      <p>Perhaps you mistyped?</p>
    </div>
  );
}
