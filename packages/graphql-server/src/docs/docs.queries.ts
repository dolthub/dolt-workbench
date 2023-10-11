export const docsQuery = `SELECT * FROM dolt_docs`;

export const docQuery = `${docsQuery} WHERE doc_name=?`;
