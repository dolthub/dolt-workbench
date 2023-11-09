export const tagsQuery = `SELECT * FROM dolt_tags ORDER BY date DESC`;

export const tagQuery = `SELECT * FROM dolt_tags WHERE tag_name=?`;

export const callDeleteTag = `CALL DOLT_TAG("-d", ?)`;

export const getCallNewTag = (hasMessage = false, hasAuthor = false) =>
  `CALL DOLT_TAG(?, ?${hasMessage ? `, "-m", ?` : ""}${getAuthorNameString(
    hasAuthor,
  )})`;

export function getAuthorNameString(hasAuthor: boolean): string {
  if (!hasAuthor) return "";
  return `, "--author", ?`;
}
