import { breakTextIntoLines } from "./utils";

describe("test breakTextIntoLines", () => {
  const tests = [
    {
      desc: "text content",
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      expectedText:
        "Lorem Ipsum is simply dummy text of the\nprinting and typesetting industry. Lorem\nIpsum has been the industry's standard\ndummy text ever since the 1500s, when an\nunknown printer took a galley of type\nand scrambled it to make a type specimen\nbook. It has survived not only five\ncenturies, but also the leap into\nelectronic typesetting, remaining\nessentially unchanged. It was\npopularised in the 1960s with the\nrelease of Letraset sheets containing\nLorem Ipsum passages, and more recently\nwith desktop publishing software like\nAldus PageMaker including versions of\nLorem Ipsum.",
    },
    {
      desc: "2 lines content",
      text: "0-day ATX Macintosh rollback DPI this with the Macintosh pdf with query",
      expectedText:
        "0-day ATX Macintosh rollback DPI this\nwith the Macintosh pdf with query",
    },
    {
      desc: "one line content",
      text: "one line",
      expectedText: "one line",
    },
    {
      desc: "NULL",
      text: "NULL",
      expectedText: "NULL",
    },
  ];
  tests.forEach(test => {
    it(test.desc, () => {
      expect(breakTextIntoLines(test.text, 40)).toEqual(test.expectedText);
    });
  });
});
