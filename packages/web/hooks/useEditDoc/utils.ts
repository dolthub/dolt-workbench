import { DocType } from "@gen/graphql-types";
import { escapeDoubleQuotes } from "@lib/dataTable";
import { fromDocType } from "@lib/toDocType";

export function getDocsQuery(docType: DocType, markdown: string): string {
  const docName = fromDocType(docType);
  if (!markdown) {
    return `DELETE FROM dolt_docs WHERE doc_name="${docName}"`;
  }
  const escaped = escapeDoubleQuotes(markdown);
  return `INSERT INTO dolt_docs VALUES ("${docName}", "${escaped}") ON DUPLICATE KEY UPDATE doc_text="${escaped}"`;
}
