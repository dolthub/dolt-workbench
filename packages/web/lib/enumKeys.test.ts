import enumKeys from "./enumKeys";

describe("test enumKeys", () => {
  it("iterates through all keys in an enum", () => {
    enum TestEnum {
      Key1 = "value1",
      Key2 = "value2",
      Key3 = "value3",
    }

    const keys = enumKeys(TestEnum);
    const t = keys.map(k => TestEnum[k]);

    expect(t).toContain(TestEnum.Key1);
    expect(t).toContain(TestEnum.Key2);
    expect(t).toContain(TestEnum.Key3);
  });
});
