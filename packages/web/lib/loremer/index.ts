import nTimes from "@lib/nTimes";
import randomArrayItem from "@lib/randomArrayItem";
import { initialUppercase, validResourceSegmentPattern } from "./utils";
import defaultWords from "./words";

type LoremerOptions = { words: string[] | string };

export default function Loremer(opts: LoremerOptions) {
  const _words =
    typeof opts.words === "string" ? parseWords(opts.words) : opts.words;

  if (_words.length === 0) {
    throw new Error(
      "Loremer refuses to be initialized with an empty dictionary. Try again and give him some damn words this time.",
    );
  }

  type WordOptions = {
    // Some of the "words" in the default dictionary are actually more than one word.
    // Accept an option to _actually_ limit the generator to a single word.
    trueSingleWord?: boolean;
    matchRegex?: RegExp;
    minLength?: number;
    maxLength?: number;
  };
  function word({
    trueSingleWord,
    minLength,
    maxLength,
    matchRegex,
  }: WordOptions = {}): string {
    const hasCriteria = trueSingleWord || minLength || maxLength || matchRegex;

    // Filter words by criteria:
    const matchingWords = hasCriteria
      ? _words.filter(
          w =>
            // If there's a regex specified, reject non-matches
            !(matchRegex && !w.match(matchRegex)) &&
            // If we want a trueSingleWord, reject words with spaces
            !(trueSingleWord && w.indexOf(" ") > -1) &&
            // If min or max lengths are specified, enforce them
            !(minLength && minLength > 0 && w.length < minLength) &&
            !(maxLength && maxLength > 0 && w.length > maxLength),
        )
      : _words;

    if (!matchingWords.length) {
      throw new Error(
        `Loremer's dictionary doesn't contain any words that satisfy the given constraints: ${JSON.stringify(
          {
            maxLength,
            minLength,
            trueSingleWord,
            matchRegex: String(matchRegex),
          },
        )}`,
      );
    }

    return randomArrayItem(matchingWords);
  }

  function resourceNameSegment() {
    return word({
      matchRegex: new RegExp(`^${validResourceSegmentPattern}$`),
      trueSingleWord: true,
    });
  }

  function words(n: number) {
    return nTimes(n, word);
  }

  type SentenceOptions = {
    max?: number;
    min?: number;
  };
  const defaultOptions = { min: 8, max: 13 };
  function sentence(options: SentenceOptions = {}) {
    const o = { ...defaultOptions, ...options };
    const [first, ...rest] = words(randomInRange(o.min, o.max));
    return (
      [initialUppercase(first), ...rest].join(" ") + randomEndingPunctuation()
    );
  }

  function sentences(n: number) {
    return nTimes(n, sentence);
  }

  function paragraph() {
    return sentences(randomInRange(2, 5)).join(" ");
  }

  return { word, words, resourceNameSegment, sentence, sentences, paragraph };
}

function randomInRange(a: number, b: number) {
  const [lower, upper] = a < b ? [a, b] : [b, a];

  const range = upper - lower;
  return Math.floor(Math.random() * range) + lower;
}

function randomEndingPunctuation() {
  return randomArrayItem([".", ".", ".", ".", "!", "?"]);
}

export function parseWords(words: string): string[] {
  return words.split(/[\s,]+/);
}

export const loremer = Loremer({ words: defaultWords() });
