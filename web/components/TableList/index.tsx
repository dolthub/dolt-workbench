import Section from "@components/DatabaseTableNav/Section";
import SchemaDiagramButton from "@components/SchemaDiagramButton";
import Link from "@components/links/Link";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { QueryHandler, Tooltip } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import useTableNames from "@hooks/useTableNames";
import { RefParams } from "@lib/params";
import { createTable } from "@lib/urls";
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import { useEffect } from "react";
import Item from "./Item";
import css from "./index.module.css";

type Props = {
  params: RefParams & { tableName?: Maybe<string> };
};

type InnerProps = Props & {
  tables: string[];
};

function Inner(props: InnerProps) {
  useEffect(() => {
    if (!props.params.tableName) return;
    const tableEl = document.getElementById(props.params.tableName);
    tableEl?.scrollIntoView();
  });

  return (
    <div>
      <Tooltip id="primary-key-tip" content="primary key" place="left" />
      {props.tables.length ? (
        <>
          <ol>
            {props.tables.map(t => (
              <Item key={t} tableName={t} params={props.params} />
            ))}
          </ol>
          <SchemaDiagramButton {...props} />
        </>
      ) : (
        <p className={css.empty}>
          No tables found for <code>{props.params.refName}</code>
        </p>
      )}
      <HideForNoWritesWrapper params={props.params}>
        <Link {...createTable(props.params)} className={css.addTable}>
          <AiOutlinePlus />
          Add new table
        </Link>
      </HideForNoWritesWrapper>
    </div>
  );
}

export default function TableList(props: Props) {
  const res = useTableNames(props.params);
  return (
    <Section tab={0} refetch={res.refetch}>
      <QueryHandler
        result={{ ...res, data: res.tables }}
        render={data => <Inner {...props} tables={data} />}
      />
    </Section>
  );
}
