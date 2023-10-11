export const tagsQuery = `SELECT * FROM dolt_tags ORDER BY date DESC`;

export const tagQuery = `SELECT * FROM dolt_tags WHERE tag_name=?`;
