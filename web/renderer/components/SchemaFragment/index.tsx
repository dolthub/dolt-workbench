import Link from "@components/links/Link";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { CopyButton, ErrorMsg, Loader } from "@dolthub/react-components";
import { useReactiveWidth } from "@dolthub/react-hooks";
import {
  RowForDataTableFragment,
  SchemaType,
  useSchemaDefinitionQuery,
} from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { parseDefinition } from "@lib/definitionUrl";
import { SqlQueryParams } from "@lib/params";
import { MdPlayCircleOutline } from "react-icons/md";
import { table } from "@lib/urls";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import css from "./index.module.css";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

type Props = {
  params: SqlQueryParams;
};

type InnerProps = Props & {
  rows: RowForDataTableFragment[];
  fragIdx: number;
  isView: boolean;
  name: string;
};

function Inner({ rows, params, fragIdx, isView, name }: InnerProps) {
  const { isMobile } = useReactiveWidth(1024);

  if (!rows.length) return <ErrorMsg errString="Definition not found" />;
  if (rows.length > 1) {
    return <ErrorMsg errString="Found two definitions with the same name" />;
  }

  const fragment = rows[0].columnValues[fragIdx]?.displayValue ?? "";

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
          <Link {...table({ ...params, tableName: name })} className={css.play}>
            <MdPlayCircleOutline />
          </Link>
        )}
        <CopyButton text={fragment} />
      </div>
    </div>
  );
}

export default function SchemaFragment(props: Props) {
  const router = useRouter();
  const { isPostgres } = useDatabaseDetails();
  const { setEditorString } = useSqlEditorContext();

  const ctx = useMemo(
    () => parseDefinition(router.query),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      router.query.definitionName,
      router.query.definitionKind,
      router.query.definitionSchema,
    ],
  );

  const res = useSchemaDefinitionQuery({
    variables: {
      databaseName: props.params.databaseName,
      refName: props.params.refName,
      schemaName: ctx?.schemaName,
      name: ctx?.name ?? "",
      kind: ctx?.kind ?? SchemaType.View,
    },
    skip: !ctx,
  });
  const data = res.data?.schemaDefinition;

  useEffect(() => {
    if (data?.queryString) setEditorString(data.queryString);
  }, [data?.queryString, setEditorString]);

  if (!ctx) return <ErrorMsg errString="Definition not found" />;
  if (res.loading) return <Loader loaded={false} />;
  if (res.error) return <ErrorMsg err={res.error} />;
  if (!data) return <ErrorMsg errString="Definition not found" />;

  return (
    <Inner
      {...props}
      rows={data.rows.list}
      fragIdx={fragIdxFor(ctx.kind, isPostgres)}
      isView={ctx.kind === SchemaType.View}
      name={ctx.name}
    />
  );
}

export function fragIdxFor(kind: SchemaType, isPostgres: boolean): number {
  if (isPostgres) return 0;
  switch (kind) {
    case SchemaType.Table:
    case SchemaType.View:
      return 1;
    case SchemaType.Trigger:
    case SchemaType.Procedure:
      return 2;
    case SchemaType.Event:
      return 3;
    default:
      return 0;
  }
}
