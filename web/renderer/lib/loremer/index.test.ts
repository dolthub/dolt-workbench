import Loremer, { parseWords } from ".";

const ourLanguage = ["foo", "bar", "baz", "boom", "bop", "ass", "doop"];
const sourceText = `foo
  bar, baz, ,boom,,,,bop,
  ass doop`;

test("parseWords parses a list of words properly", () => {
  expect(parseWords(sourceText)).toEqual(ourLanguage);
});

test("Loremer throws an error when initialized with an empty dictionary", () => {
  expect(() => Loremer({ words: [] })).toThrow(
    "initialized with an empty dictionary",
  );
});

const loremer = Loremer({ words: ourLanguage });

test("loremer.word returns a word from the language", () => {
  expect(ourLanguage).toContain(loremer.word());
});

test("loremer.word can be limited to a true single word", () => {
  const wordyLoremer = Loremer({ words: ["actually three words", "oneword"] });
  const word = wordyLoremer.word({ trueSingleWord: true });
  expect(word).toBe("oneword");
});

test("loremer.word can be constrained by min and max length", () => {
  const lengthyLoremer = Loremer({ words: ["123", "12345", "1234567"] });
  const word = lengthyLoremer.word({ minLength: 4, maxLength: 6 });
  expect(word).toBe("12345");
});

test("loremer.word can combine the length and single-word constraints", () => {
  const comboLoremer = Loremer({
    words: ["123", "12 4", "12345", "1234 6", "1234567"],
  });
  const word = comboLoremer.word({
    maxLength: 6,
    minLength: 4,
    trueSingleWord: true,
  });
  expect(word).toBe("12345");
});

test("loremer.word can accept a regex to match against", () => {
  expect(loremer.word({ matchRegex: /boom/ })).toBe("boom");
});

test("loremer.word throws an error if given impossible constraints", () => {
  const errorLoremer = Loremer({
    words: ["1", "12", "123"],
  });
  expect(() => errorLoremer.word({ minLength: 4 })).toThrow(
    "Loremer's dictionary doesn't contain any words that satisfy the given constraints",
  );
});

test("loremer.resourceNameSegment returns a word suitable for use in a resource name", () => {
  const resourcefulLoremer = Loremer({
    words: ["not valid", "so-very-valid", "also NOT va1id"],
  });
  expect(resourcefulLoremer.resourceNameSegment()).toBe("so-very-valid");
});

test("loremer.words returns a given number of words from the language", () => {
  const words = loremer.words(5);

  expect(words.length).toBe(5);
  words.forEach(word => expect(ourLanguage).toContain(word));
});

test("loremer.sentence returns a sentence with a bunch of words from the language", () => {
  const sentence = loremer.sentence();
  const someWordsAreInThere = ourLanguage.some(
    ourWord => !!sentence.match(ourWord),
  );
  expect(someWordsAreInThere).toBe(true);
});

test("loremer.sentence adds initial capitalization and an ending punctuation mark", () => {
  const sentence = loremer.sentence();
  const [firstChar] = sentence;
  const [lastChar] = [...sentence].reverse();

  expect(firstChar).toMatch(/[A-Z]/);
  expect(lastChar).toMatch(/[!?.]/);
});

test("loremer.sentences returns a bunch of sentences with words from the language", () => {
  const sentences = loremer.sentences(5);
  expect(sentences.length).toBe(5);
  const someWordsAreInThere = sentences.every(sentence =>
    ourLanguage.some(ourWord => !!sentence.match(ourWord)),
  );
  expect(someWordsAreInThere).toBe(true);
});

test("loremer.paragraph pastes a bunch of sentences with words from the language together", () => {
  const paragraph = loremer.paragraph();
  expect(typeof paragraph).toBe("string");

  const isReasonableLength = paragraph.length >= 50 && paragraph.length <= 500;
  expect(isReasonableLength).toBe(true);
});
