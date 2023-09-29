const truncate = (str: string, len: number) => `${str.slice(0, len - 1)}…`;

export default (str: string, len = 100) =>
  str.length < len ? str : truncate(str, len);
