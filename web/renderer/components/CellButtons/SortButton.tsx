/* eslint-disable @typescript-eslint/naming-convention */
import { useDataTableContext } from "@contexts/dataTable";
import { Button } from "@dolthub/react-components";
import { ColumnForDataTableFragment, SortDirection } from "@gen/graphql-types";
import useDataTableStack from "@hooks/useDataTableStack";
import { getColumnSort, setColumnSort } from "@lib/dataTableParams";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import css from "./index.module.css";

type Direction = "ASC" | "DESC" | undefined;

type Props = {
  col: ColumnForDataTableFragment;
  dir?: Direction;
  dataCy?: string;
};

export default function SortButton({ col, dir, dataCy }: Props) {
  const { tableShape } = useDataTableContext();
  const { stack, update } = useDataTableStack();

  if (!tableShape) return null;
  const currentDir = getColumnSort(stack.orderBy, col.name);
  const targetDir = toSortDirection(dir);
  const checked = currentDir === targetDir;
  const sortDirection = getDirection(dir, col.type);

  const onClick = () => {
    update({
      ...stack,
      orderBy: setColumnSort(stack.orderBy, col.name, targetDir),
    });
  };

  return (
    <Button.Link
      onClick={onClick}
      className={css.button}
      disabled={checked}
      data-cy={`${dataCy}-${sortDirection}`}
    >
      Sort {sortDirection}
      {checked && <FiCheck className={css.check} />}
    </Button.Link>
  );
}

function toSortDirection(dir: Direction): SortDirection | undefined {
  if (dir === "ASC") return SortDirection.Asc;
  if (dir === "DESC") return SortDirection.Desc;
  return undefined;
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
