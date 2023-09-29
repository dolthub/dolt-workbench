export default function (data: any): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(err);
    return `${data}`;
  }
}

export function prettyJSONText(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch (err) {
    console.error(err);
    return text;
  }
}
