import { ColumnForDataTableFragment, SortDirection } from "@gen/graphql-types";
import {
  appendExcludePk,
  appendWhere,
  getColumnSort,
  parseStackingParams,
  removeFromProjection,
  setColumnSort,
  stackingParamsToQuery,
} from "./dataTableParams";

const idCol: ColumnForDataTableFragment = {
  name: "id",
  type: "int",
  isPrimaryKey: true,
};
const tenantCol: ColumnForDataTableFragment = {
  name: "tenant_id",
  type: "int",
  isPrimaryKey: true,
};
const nameCol: ColumnForDataTableFragment = {
  name: "name",
  type: "varchar",
  isPrimaryKey: false,
};

describe("parseStackingParams", () => {
  it("returns empty stack when query has no stacking keys", () => {
    expect(parseStackingParams({}, [idCol, nameCol])).toEqual({
      orderBy: undefined,
      where: undefined,
      excludePks: undefined,
      projection: undefined,
    });
  });

  it("decodes orderBy with single value", () => {
    expect(
      parseStackingParams({ orderBy: "name.asc" }, [idCol, nameCol]).orderBy,
    ).toEqual([{ column: "name", direction: SortDirection.Asc }]);
  });

  it("decodes stacked orderBy values in order", () => {
    expect(
      parseStackingParams({ orderBy: ["name.asc", "id.desc"] }, [
        idCol,
        nameCol,
      ]).orderBy,
    ).toEqual([
      { column: "name", direction: SortDirection.Asc },
      { column: "id", direction: SortDirection.Desc },
    ]);
  });

  it("drops orderBy entries with invalid direction", () => {
    expect(
      parseStackingParams({ orderBy: ["name.bogus", "id.asc"] }, [
        idCol,
        nameCol,
      ]).orderBy,
    ).toEqual([{ column: "id", direction: SortDirection.Asc }]);
  });

  it("decodes where and looks up type from columns", () => {
    expect(
      parseStackingParams({ where: "name.taylor" }, [idCol, nameCol]).where,
    ).toEqual([{ column: "name", value: "taylor", type: "varchar" }]);
  });

  it("decodes URL-encoded where values", () => {
    expect(
      parseStackingParams({ where: "name.taylor%20s" }, [idCol, nameCol]).where,
    ).toEqual([{ column: "name", value: "taylor s", type: "varchar" }]);
  });

  it("decodes hide for single-PK table", () => {
    expect(
      parseStackingParams({ hide: ["5", "7"] }, [idCol, nameCol]).excludePks,
    ).toEqual([
      { values: [{ column: "id", value: "5", type: "int" }] },
      { values: [{ column: "id", value: "7", type: "int" }] },
    ]);
  });

  it("decodes hide for composite-PK table with comma-joined values", () => {
    expect(
      parseStackingParams({ hide: "1,5" }, [tenantCol, idCol, nameCol])
        .excludePks,
    ).toEqual([
      {
        values: [
          { column: "tenant_id", value: "1", type: "int" },
          { column: "id", value: "5", type: "int" },
        ],
      },
    ]);
  });

  it("drops hide entries whose value count doesn't match PK arity", () => {
    expect(
      parseStackingParams({ hide: ["1", "1,5"] }, [tenantCol, idCol, nameCol])
        .excludePks,
    ).toEqual([
      {
        values: [
          { column: "tenant_id", value: "1", type: "int" },
          { column: "id", value: "5", type: "int" },
        ],
      },
    ]);
  });

  it("decodes projection list", () => {
    expect(
      parseStackingParams({ projection: ["id", "name"] }, [idCol, nameCol])
        .projection,
    ).toEqual(["id", "name"]);
  });

  it("drops empty-string projection entries", () => {
    expect(
      parseStackingParams({ projection: ["id", ""] }, [idCol, nameCol])
        .projection,
    ).toEqual(["id"]);
  });
});

describe("stackingParamsToQuery", () => {
  it("returns undefined for empty stack fields", () => {
    expect(stackingParamsToQuery({})).toEqual({
      orderBy: undefined,
      where: undefined,
      hide: undefined,
      projection: undefined,
    });
  });

  it("encodes orderBy as column.direction", () => {
    const out = stackingParamsToQuery({
      orderBy: [
        { column: "name", direction: SortDirection.Asc },
        { column: "id", direction: SortDirection.Desc },
      ],
    });
    expect(out.orderBy).toEqual(["name.asc", "id.desc"]);
  });

  it("encodes where as column.value with URL-escaped value", () => {
    const out = stackingParamsToQuery({
      where: [{ column: "name", value: "taylor s", type: "varchar" }],
    });
    expect(out.where).toEqual(["name.taylor%20s"]);
  });

  it("encodes excludePks values as comma-joined positional", () => {
    const out = stackingParamsToQuery({
      excludePks: [
        {
          values: [
            { column: "tenant_id", value: "1", type: "int" },
            { column: "id", value: "5", type: "int" },
          ],
        },
      ],
    });
    expect(out.hide).toEqual(["1,5"]);
  });

  it("encodes projection as-is", () => {
    const out = stackingParamsToQuery({ projection: ["id", "name"] });
    expect(out.projection).toEqual(["id", "name"]);
  });
});

describe("setColumnSort", () => {
  it("appends a new sort when column not present", () => {
    expect(setColumnSort(undefined, "name", SortDirection.Asc)).toEqual([
      { column: "name", direction: SortDirection.Asc },
    ]);
  });

  it("replaces direction when column already present", () => {
    expect(
      setColumnSort(
        [{ column: "name", direction: SortDirection.Asc }],
        "name",
        SortDirection.Desc,
      ),
    ).toEqual([{ column: "name", direction: SortDirection.Desc }]);
  });

  it("removes the column when direction is undefined", () => {
    expect(
      setColumnSort(
        [
          { column: "name", direction: SortDirection.Asc },
          { column: "id", direction: SortDirection.Desc },
        ],
        "name",
        undefined,
      ),
    ).toEqual([{ column: "id", direction: SortDirection.Desc }]);
  });

  it("preserves order of unchanged columns when replacing", () => {
    expect(
      setColumnSort(
        [
          { column: "a", direction: SortDirection.Asc },
          { column: "b", direction: SortDirection.Asc },
        ],
        "a",
        SortDirection.Desc,
      ),
    ).toEqual([
      { column: "a", direction: SortDirection.Desc },
      { column: "b", direction: SortDirection.Asc },
    ]);
  });
});

describe("getColumnSort", () => {
  it("returns the direction for a matching column", () => {
    expect(
      getColumnSort(
        [{ column: "name", direction: SortDirection.Desc }],
        "name",
      ),
    ).toBe(SortDirection.Desc);
  });

  it("returns undefined when column not in sort list", () => {
    expect(getColumnSort(undefined, "name")).toBeUndefined();
    expect(getColumnSort([], "name")).toBeUndefined();
  });
});

describe("appendWhere", () => {
  it("starts a new list when current is undefined", () => {
    expect(
      appendWhere(undefined, { column: "a", value: "1", type: "int" }),
    ).toEqual([{ column: "a", value: "1", type: "int" }]);
  });

  it("appends to the end of an existing list", () => {
    expect(
      appendWhere([{ column: "a", value: "1", type: "int" }], {
        column: "b",
        value: "2",
        type: "int",
      }),
    ).toEqual([
      { column: "a", value: "1", type: "int" },
      { column: "b", value: "2", type: "int" },
    ]);
  });
});

describe("appendExcludePk", () => {
  it("appends a row to an empty list", () => {
    expect(
      appendExcludePk(undefined, {
        values: [{ column: "id", value: "5", type: "int" }],
      }),
    ).toEqual([{ values: [{ column: "id", value: "5", type: "int" }] }]);
  });

  it("appends a row to an existing list", () => {
    const existing = [{ values: [{ column: "id", value: "1", type: "int" }] }];
    const added = { values: [{ column: "id", value: "2", type: "int" }] };
    expect(appendExcludePk(existing, added)).toEqual([...existing, added]);
  });
});

describe("removeFromProjection", () => {
  it("initializes from allColumns when current is undefined", () => {
    expect(removeFromProjection(undefined, "b", ["a", "b", "c"])).toEqual([
      "a",
      "c",
    ]);
  });

  it("initializes from allColumns when current is empty", () => {
    expect(removeFromProjection([], "b", ["a", "b", "c"])).toEqual(["a", "c"]);
  });

  it("removes from existing projection", () => {
    expect(removeFromProjection(["a", "b"], "a", ["a", "b", "c"])).toEqual([
      "b",
    ]);
  });
});

describe("parse/encode round-trip", () => {
  it("orderBy survives encode → parse", () => {
    const orderBy = [
      { column: "name", direction: SortDirection.Asc },
      { column: "id", direction: SortDirection.Desc },
    ];
    const encoded = stackingParamsToQuery({ orderBy });
    expect(
      parseStackingParams({ orderBy: encoded.orderBy }, [idCol, nameCol])
        .orderBy,
    ).toEqual(orderBy);
  });

  it("where survives encode → parse", () => {
    const where = [{ column: "name", value: "taylor s", type: "varchar" }];
    const encoded = stackingParamsToQuery({ where });
    expect(
      parseStackingParams({ where: encoded.where }, [idCol, nameCol]).where,
    ).toEqual(where);
  });

  it("excludePks survives encode → parse for composite PK", () => {
    const excludePks = [
      {
        values: [
          { column: "tenant_id", value: "1", type: "int" },
          { column: "id", value: "5", type: "int" },
        ],
      },
    ];
    const encoded = stackingParamsToQuery({ excludePks });
    expect(
      parseStackingParams({ hide: encoded.hide }, [tenantCol, idCol, nameCol])
        .excludePks,
    ).toEqual(excludePks);
  });
});
