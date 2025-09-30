import Section from "@components/DatabaseTableNav/Section";
import SchemaDiagramButton from "@components/SchemaDiagramButton";
import Link from "@components/links/Link";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { QueryHandler, Tooltip } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import { RefOptionalSchemaParams } from "@lib/params";
import { createTable } from "@lib/urls";
import { AiOutlinePlusCircle } from "@react-icons/all-files/ai/AiOutlinePlusCircle";
import { useEffect } from "react";
import Item from "./Item";
import css from "./index.module.css";
import {
  TableNameWithStatus,
  useTableNamesWithStatus,
} from "@components/TableList/useTableNamesWithStatus";

type Props = {
  params: RefOptionalSchemaParams & {
    tableName?: Maybe<string>;
  };
};

type InnerProps = Props & {
  tables: TableNameWithStatus[];
};

function Inner(props: InnerProps) {
  useEffect(() => {
    if (!props.params.tableName) return;
    const tableEl = document.getElementById(props.params.tableName);
    tableEl?.scrollIntoView();
  });

  return (
    <div data-cy="db-tables-table-list">
      <Tooltip id="primary-key-tip" content="primary key" place="left" />
      {props.tables.length ? (
        <ol className={css.tableList}>
          {props.tables.map(t => (
            <Item
              key={t.name}
              tableName={t.name}
              status={t.status}
              params={props.params}
            />
          ))}
        </ol>
      ) : (
        <p className={css.empty}>
          No tables found for <code>{props.params.refName}</code>
        </p>
      )}
      <div className={css.bottom}>
        {props.tables.length > 0 && <SchemaDiagramButton {...props} />}
        <HideForNoWritesWrapper params={props.params}>
          <Link {...createTable(props.params)} className={css.addTable}>
            <AiOutlinePlusCircle />
            Add new table
          </Link>
        </HideForNoWritesWrapper>
      </div>
    </div>
  );
}

export default function TableList(props: Props) {
  const res = useTableNamesWithStatus(props.params);
  return (
    <Section tab={0} refetch={res.refetch}>
      <QueryHandler
        result={{ ...res, data: res.tables }}
        render={data => <Inner {...props} tables={data} />}
      />
    </Section>
  );
}
