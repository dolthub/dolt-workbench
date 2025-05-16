const fullWidthRegex = /[^\u0020-\u007E]/;

// Half-width characters have a width of 1, while full-width characters, like those in Japanese and Chinese, have a width of 2.
function truncate(str: string, len: number): string {
  let truncated = "";
  let width = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const char of str) {
    width += fullWidthRegex.test(char) ? 2 : 1;

    if (width > len - 1) {
      return `${truncated}…`;
    }

    truncated += char;
  }

  return truncated;
}

export default function excerpt(str: string, len = 100): string {
  return truncate(str, len);
}
