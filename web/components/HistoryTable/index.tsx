import SqlDataTable from "@components/SqlDataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button, ErrorMsg } from "@dolthub/react-components";
import { SqlQueryParams } from "@lib/params";
import { useState } from "react";
import css from "./index.module.css";
import { useGetDoltHistoryQuery } from "./queryHelpers";

type Props = {
  params: SqlQueryParams;
};

const whitespace = /\r\n|\n+|\r+|\s+/gm;

export default function HistoryTable(props: Props) {
  const { executeQuery } = useSqlEditorContext();
  const forRow = props.params.q.split(whitespace)[1] === "*";
  const [err, setErr] = useState("");
  const generateQuery = useGetDoltHistoryQuery(props.params.q);

  const onClick = async () => {
    const query = generateQuery();
    if (query === "") {
      setErr("Error generating history query. We are working on a fix.");
      return;
    }
    await executeQuery({ ...props.params, query });
  };

  return (
    <div>
      <SqlDataTable {...props} />
      <Button.Link className={css.seeAll} onClick={onClick}>
        See all commits including ones that did not change this{" "}
        {forRow ? "row" : "cell"}
      </Button.Link>
      <ErrorMsg errString={err} className={css.err} />
    </div>
  );
}
