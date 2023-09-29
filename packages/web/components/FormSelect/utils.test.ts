import { fakeOrgParams } from "@hosted/fakers/src/fakeOrg";
import { nTimes } from "@hosted/utils";
import { OrgParams } from "@lib/params";
import { Option } from "./types";
import { getValueForOptions, moveSelectedToTop } from "./utils";

const stringOps: Option[] = [
  { value: "taylor", label: "Taylor" },
  { value: "katie", label: "Katie" },
  { value: "tim", label: "Tim" },
];

const orgParams = nTimes(3, fakeOrgParams);
const orgParamsOps: Option[] = orgParams.map(r => {
  return {
    value: r,
    label: `Org: ${r.orgName}`,
  };
});

function orgParamsAreEqual(o: OrgParams, v: OrgParams): boolean {
  return o.orgName === v.orgName;
}

describe("test form select utils", () => {
  it("gets value for options", () => {
    // Options with string values
    expect(getValueForOptions<Option>("katie", stringOps)).toEqual(
      stringOps[1],
    );
    expect(getValueForOptions<Option>("taylor", stringOps)).toEqual(
      stringOps[0],
    );
    expect(getValueForOptions<Option>(null, stringOps)).toBeNull();
    expect(getValueForOptions<Option>("brian", stringOps)).toBeUndefined();

    // Options with DatabaseParam values, which reqiure a getValFunc
    expect(
      getValueForOptions<Option>(orgParams[1], orgParamsOps, orgParamsAreEqual),
    ).toEqual(orgParamsOps[1]);
  });
});

describe("test moveSelectedToTop", () => {
  it("moves the selected item to the top of the array", () => {
    stringOps.forEach(selected => {
      const out = moveSelectedToTop(selected.value, stringOps);
      expect(out).toHaveLength(stringOps.length);
      expect(out[0]).toEqual(selected);
    });
  });

  it("does not modify options if selectedVal is null", () => {
    const out = moveSelectedToTop(null, stringOps);
    expect(out).toEqual(stringOps);
  });

  it("does not modify options if selectedVal is invalid", () => {
    const out = moveSelectedToTop("some invalid value", stringOps);
    expect(out).toEqual(stringOps);
  });
});
