// safeJSONParse attempts to parse a JSON string, and if it fails returns the
// original string instead of throwing an error
export default function safeJSONParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (_) {
    return text;
  }
}
