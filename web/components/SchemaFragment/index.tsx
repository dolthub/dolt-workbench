import CopyButton from "@components/CopyButton";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Btn, ErrorMsg, QueryHandler } from "@dolthub/react-components";
import { useReactiveWidth } from "@dolthub/react-hooks";
import {
  RowForDataTableFragment,
  useSqlSelectForSqlDataTableQuery,
} from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { SqlQueryParams } from "@lib/params";
import { MdPlayCircleOutline } from "@react-icons/all-files/md/MdPlayCircleOutline";
import dynamic from "next/dynamic";
import css from "./index.module.css";
import { getSchemaInfo } from "./util";

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
  const { selectFromTable } = useSqlBuilder();
  const { isView, fragIdx } = getSchemaInfo(params.q);
  const { queryClickHandler } = useSqlEditorContext("Views");
  const { isMobile } = useReactiveWidth(1024);

  const executeView = async (tableName: string) => {
    const query = selectFromTable(tableName);
    await queryClickHandler({ ...params, query });
  };

  if (!rows.length) return <ErrorMsg errString="View not found" />;
  if (rows.length > 1) {
    return <ErrorMsg errString="Found two views with the same name" />;
  }

  const name = rows[0].columnValues[0].displayValue;
  const fragment = rows[0].columnValues[fragIdx].displayValue;

  return (
    <div className={css.top}>
      <AceEditor
        value={fragment}
        name="AceViewer"
        fontSize={13}
        readOnly
        wrapEnabled
        focus
        showPrintMargin={false}
        showGutter={false}
        height={isMobile ? "calc(100vh - 38rem)" : "calc(100vh - 28rem)"}
        light
      />
      <div className={css.buttons}>
        {isView && (
          <Btn className={css.play} onClick={async () => executeView(name)}>
            <MdPlayCircleOutline />
          </Btn>
        )}
        <CopyButton text={fragment} />
      </div>
    </div>
  );
}

export default function SchemaFragment(props: Props) {
  const res = useSqlSelectForSqlDataTableQuery({
    variables: { ...props.params, queryString: props.params.q },
  });
  return (
    <QueryHandler
      result={res}
      render={data => <Inner {...props} rows={data.sqlSelect.rows} />}
    />
  );
}
