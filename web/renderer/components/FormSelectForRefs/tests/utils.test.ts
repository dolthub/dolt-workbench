import { pluralize } from "@dolthub/web-utils";
import { screen, waitFor } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";
import { Test, branchError } from "./mocks";

export async function testRenderComponent(
  test: Test,
  user: UserEvent,
  label2: string,
  error2: string,
  testOnChange: (v: string) => Promise<void>,
) {
  const lowerLabel = label2.toLowerCase();
  const pluralLabel = pluralize(2, label2);
  const lowerPluralLabel = pluralLabel.toLowerCase();

  const selected = test.value;
  if (!selected) {
    const placeholder = screen.getByText(`select a branch or ${lowerLabel}...`);
    expect(placeholder).toBeVisible();
    await user.click(placeholder);

    expect(screen.getByRole("button", { name: "Branches" })).toBeVisible();
    expect(screen.getByRole("button", { name: pluralLabel })).toBeVisible();

    if (test.error) {
      expect(screen.getByText(new RegExp(branchError))).toBeVisible();
    } else if (test.empty) {
      expect(screen.getByText("No branches found")).toBeVisible();
    } else {
      expect(screen.queryByText("No branches found")).not.toBeInTheDocument();
    }

    expect(screen.getByText("View all branches")).toBeVisible();

    await user.click(screen.getByRole("button", { name: pluralLabel }));

    if (test.error) {
      expect(screen.getByText(new RegExp(error2))).toBeVisible();
    } else if (test.empty) {
      expect(screen.getByText(`No ${lowerPluralLabel} found`)).toBeVisible();
    } else {
      expect(
        screen.queryByText(`No ${lowerPluralLabel} found`),
      ).not.toBeInTheDocument();
    }

    expect(screen.getByText(`View all ${lowerPluralLabel}`)).toBeVisible();

    return;
  }

  await waitForVisibleValueToClick(user, selected, lowerLabel);

  expect(screen.getByRole("button", { name: "Branches" })).toBeVisible();
  expect(screen.getByRole("button", { name: pluralLabel })).toBeVisible();

  if (test.valueToSelect) {
    await testValueToSelect(test.valueToSelect, user, testOnChange);
  }
}

export async function waitForVisibleValueToClick(
  user: UserEvent,
  selected: string,
  lowerLabel: string,
) {
  await waitFor(() =>
    expect(
      screen.queryByText(`select a branch or ${lowerLabel}...`),
    ).not.toBeInTheDocument(),
  );

  expect(
    await screen.findByLabelText(`single-value-${selected}`),
  ).toBeVisible();

  await user.click(screen.getByText(selected));
}

export async function testValueToSelect(
  v: string,
  user: UserEvent,
  testOnChange: (v: string) => Promise<void>,
) {
  expect(await screen.findByText(v)).toBeVisible();
  await user.click(screen.getByLabelText(`select-option-${v}`));

  await waitFor(async () => testOnChange(v));
}

// Need to place the above functions in a .test.tsx file, so there needs to be at least one test in the file
describe("utils test", () => {
  it("works", () => {});
});
