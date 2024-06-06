import { sprintf } from "./sprintf";

describe("test sprintf", () => {
  it("should replace single $ with provided argument", () => {
    const result = sprintf("Hello, $!", "world");
    expect(result).toBe("Hello, world!");
  });

  it("should replace multiple $ with corresponding arguments", () => {
    const result = sprintf(
      "$ is $, and $ is $",
      "This",
      "a test",
      "this",
      "a test",
    );
    expect(result).toBe("This is a test, and this is a test");
  });

  it("should handle no replacements if no $ in string", () => {
    const result = sprintf("No placeholders here.");
    expect(result).toBe("No placeholders here.");
  });

  it("should handle no arguments provided", () => {
    const result = sprintf("Hello, $!");
    expect(result).toBe("Hello, $!");
  });

  it("should handle extra arguments provided", () => {
    const result = sprintf("Hello, $!", "world", "extra");
    expect(result).toBe("Hello, world!");
  });

  it("should handle fewer arguments than placeholders", () => {
    const result = sprintf("Hello, $ and $!", "world");
    expect(result).toBe("Hello, world and $!");
  });

  it("should replace multiple $ with numbers", () => {
    const result = sprintf("$ + $ = $", 1, 2, 3);
    expect(result).toBe("1 + 2 = 3");
  });

  it("should replace multiple $ with mixed types", () => {
    const result = sprintf("$ is $ and $ is $", "1", 2, true, "false");
    expect(result).toBe("1 is 2 and true is false");
  });

  it("should replace $ with empty string if provided as an argument", () => {
    const result = sprintf("Hello, $!", "");
    expect(result).toBe("Hello, !");
  });

  it("should handle null and undefined as arguments", () => {
    const result = sprintf("Hello, $ and $!", null, undefined);
    expect(result).toBe("Hello, null and undefined!");
  });
});
