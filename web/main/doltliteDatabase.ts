import path from "path";

export type DoltLiteDatabaseDestination = {
  fileName: string;
  filePath: string;
};

export function getDoltLiteDatabaseDestination(
  directory: string,
  databaseName: string,
): DoltLiteDatabaseDestination | undefined {
  const name = databaseName.trim();
  if (!directory || !path.isAbsolute(directory) || !name) return undefined;

  const parsed = path.parse(name);
  if (parsed.dir || parsed.base === "." || parsed.base === "..") {
    return undefined;
  }

  const fileName =
    parsed.ext.toLowerCase() === ".db"
      ? `${parsed.name}.db`
      : `${parsed.base}.db`;
  return { fileName, filePath: path.join(directory, fileName) };
}

export function isDoltLiteDatabaseFilePath(filePath: string): boolean {
  return path.isAbsolute(filePath) && path.extname(filePath) === ".db";
}
