export function isDefaultDocOrDocNamesMatch(
  docName?: string,
  doltDocsQueryDocName?: string,
): boolean {
  // If no doc from default doc query, doc does not exist
  if (!doltDocsQueryDocName) return false;
  // If no docName url param, use default doc query doc name
  if (!docName) return true;
  // If docName url param exists it must match default doc query doc name
  return docName.toLowerCase() === doltDocsQueryDocName.toLowerCase();
}
