import Btn from "@components/Btn";
import CopyButton from "@components/CopyButton";
import ErrorMsg from "@components/ErrorMsg";
import QueryHandler from "@components/util/QueryHandler";
import { useSqlEditorContext } from "@contexts/sqleditor";
import {
  RowForDataTableFragment,
  useSqlSelectForSqlDataTableQuery,
} from "@gen/graphql-types";
import { useReactiveWidth } from "@hooks/useReactiveSize";
import { SqlQueryParams } from "@lib/params";
import { MdPlayCircleOutline } from "@react-icons/all-files/md/MdPlayCircleOutline";
import dynamic from "next/dynamic";
import css from "./index.module.css";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

type Props = {
  params: SqlQueryParams;
};

type InnerProps = Props & {
  rows: RowForDataTableFragment[];
};

function Inner({ rows, params }: InnerProps) {
  const { queryClickHandler } = useSqlEditorContext("Views");
  const { isMobile } = useReactiveWidth(null, 1024);

  const executeView = async (tableName: string) => {
    const query = `SELECT * FROM \`${tableName}\``;
    await queryClickHandler({ ...params, query });
  };

  if (!rows.length) return <ErrorMsg errString="View not found" />;
  if (rows.length > 1) {
    return <ErrorMsg errString="Found two views with the same name" />;
  }

  const name = rows[0].columnValues[0].displayValue;
  const fragment = rows[0].columnValues[1].displayValue;

  return (
    <div className={css.top}>
      <AceEditor
        className="ace-view"
        value={fragment}
        name="AceViewer"
        fontSize={13}
        readOnly
        wrapEnabled
        focus
        showGutter={false}
        height={isMobile ? "calc(100vh - 38rem)" : "calc(100vh - 28rem)"}
      />
      <div className={css.buttons}>
        <Btn className={css.play} onClick={async () => executeView(name)}>
          <MdPlayCircleOutline />
        </Btn>
        <CopyButton text={fragment} />
      </div>
    </div>
  );
}

export default function ViewFragment(props: Props) {
  const res = useSqlSelectForSqlDataTableQuery({
    variables: { queryString: props.params.q },
  });
  return (
    <QueryHandler
      result={res}
      render={data => <Inner {...props} rows={data.sqlSelect.rows} />}
    />
  );
}
