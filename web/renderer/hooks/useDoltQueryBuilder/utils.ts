export const diffColumns = [
  "from_commit",
  "from_commit_date",
  "to_commit",
  "to_commit_date",
];

export function getAllSelectColumns(
  cols: Array<{ names: string[] }>,
): string[] {
  const allCols: string[] = [];
  const reduced = cols.reduce(
    (all, c) => all.concat(getToAndFromCols(c.names)),
    allCols,
  );

  return ["diff_type"].concat(reduced).concat(diffColumns);
}

// For every name add to_ and from_ prefixes
export function getToAndFromCols(names: string[]): string[] {
  const allCols: string[] = [];
  return names.reduce(
    (all, name) => all.concat(`from_${name}`, `to_${name}`),
    allCols,
  );
}
