export type Test<T> = { args: T; expected: string; desc: string };

export type Tests<T> = Array<Test<T>>;
