const replaceToken = "$";

export const sprintf = (str: string, ...argv: any[]): string => {
  if (!argv.length) return str;
  // eslint-disable-next-line no-return-assign, no-param-reassign
  return sprintf((str = str.replace(replaceToken, argv.shift())), ...argv);
};
