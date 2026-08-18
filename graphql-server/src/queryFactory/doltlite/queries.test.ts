import { getCloneRemoteUrl } from "./queries";

describe("getCloneRemoteUrl", () => {
  it("expands a DoltHub owner/database path to the DoltLite remote URL", () => {
    expect(getCloneRemoteUrl("dolthub/remote-prod-test")).toBe(
      "https://doltliteremoteapi.dolthub.com/dolthub/remote-prod-test",
    );
  });

  it.each([
    "file:///tmp/remote.db",
    "http://localhost:8080/remote.db",
    "https://example.com/remote.db",
  ])("preserves an explicit remote URL: %s", remote => {
    expect(getCloneRemoteUrl(remote)).toBe(remote);
  });
});
