export type Test<T> = {
  args: T;
  expected: (isPG: boolean) => string;
  desc: string;
};

export type Tests<T> = Array<Test<T>>;
