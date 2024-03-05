/* eslint-disable @typescript-eslint/naming-convention */
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import useSqlParser from "@hooks/useSqlParser";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import css from "./index.module.css";

type Direction = "ASC" | "DESC" | undefined;

type Props = {
  col: ColumnForDataTableFragment;
  dir?: Direction;
};

export default function SortButton({ col, dir }: Props) {
  const { queryHasOrderBy } = useSqlParser();
  const { convertToSqlWithOrderBy, selectFromTable } = useSqlBuilder();
  const { executeQuery } = useSqlEditorContext();
  const { params } = useDataTableContext();
  const q = params.q ?? selectFromTable(params.tableName ?? "");
  const checked = queryHasOrderBy(q, col.name, dir);

  const onClick = async () => {
    const query = convertToSqlWithOrderBy(q, col.name, dir);
    await executeQuery({ ...params, query });
  };

  return (
    <div>
      <Button.Link onClick={onClick} className={css.button} disabled={checked}>
        Sort {getDirection(dir, col.type)}
        {checked && <FiCheck className={css.check} />}
      </Button.Link>
    </div>
  );
}

function getDirection(dir: Direction, type: string): string {
  const directions = getDirectionsForType(type);
  switch (dir) {
    case "ASC":
    case "DESC":
      return directions[dir];
    default:
      return "default";
  }
}

type Directions = {
  ASC: string;
  DESC: string;
};

function getDirectionsForType(type: string): Directions {
  const lowerType = type.toLowerCase();
  if (
    startsWithOneOf(lowerType, [
      "bigint",
      "bit",
      "decimal",
      "double",
      "float",
      "int",
      "mediumint",
      "smallint",
      "tinyint",
    ])
  ) {
    return {
      ASC: "low-high",
      DESC: "high-low",
    };
  }
  if (
    startsWithOneOf(lowerType, [
      "binary",
      "blob",
      "char",
      "enum",
      "longblob",
      "longtext",
      "mediumblob",
      "mediumtext",
      "set",
      "text",
      "tinyblob",
      "tinytext",
      "varbinary",
      "varchar",
    ])
  ) {
    return {
      ASC: "A-Z",
      DESC: "Z-A",
    };
  }
  if (
    startsWithOneOf(lowerType, [
      "date",
      "datetime",
      "time",
      "timestamp",
      "year",
    ])
  ) {
    return {
      ASC: "old-new",
      DESC: "new-old",
    };
  }
  return {
    ASC: "ASC",
    DESC: "DESC",
  };
}

function startsWithOneOf(str: string, prefixes: string[]): boolean {
  for (let i = 0; i < prefixes.length; i++) {
    if (str.startsWith(prefixes[i])) {
      return true;
    }
  }
  return false;
}
