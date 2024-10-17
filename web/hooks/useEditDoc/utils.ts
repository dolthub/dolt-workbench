import { DocType } from "@gen/graphql-types";
import { escapeDoubleQuotes, escapeSingleQuotes } from "@lib/dataTable";
import { fromDocType } from "@lib/toDocType";

export function getDocsQuery(
  docType: DocType,
  markdown: string,
  isPostgres = false,
): string {
  const docName = fromDocType(docType);
  if (!markdown) {
    return `DELETE FROM dolt_docs WHERE doc_name='${docName}'`;
  }
  if (isPostgres) {
    const escaped = escapeSingleQuotes(markdown);
    // TODO(doltgres): Add ON CONFLICT UPDATE
    return `INSERT INTO dolt_docs VALUES ('${docName}', '${escaped}')`;
  }
  const escaped = escapeDoubleQuotes(markdown);
  return `REPLACE INTO dolt_docs VALUES ("${docName}", "${escaped}")`;
}
