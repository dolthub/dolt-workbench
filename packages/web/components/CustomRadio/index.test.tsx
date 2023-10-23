import { setup } from "@lib/testUtils.test";
import { screen } from "@testing-library/react";
import CustomRadio from ".";

describe("test CustomCheckbox", () => {
  const mocks = [
    { name: "one", label: "one-label" },
    { name: "two", label: "two-label" },
    { name: "three", label: "three-label" },
  ];

  mocks.forEach((mock, ind) => {
    it(`renders CustomRadio for of label ${mock.label}`, async () => {
      const checked = ind % 2 === 0;
      const disabled = ind === 2;
      const onChangeValue = jest.fn();

      const { user } = setup(
        <CustomRadio
          {...mock}
          onChange={onChangeValue}
          checked={checked}
          className="classname"
          disabled={disabled}
        >
          {mock.label}
        </CustomRadio>,
      );
      const content = screen.getByLabelText(mock.label);
      expect(content).toBeVisible();
      if (!disabled) {
        const input = screen.getByRole("radio");
        if (checked) {
          expect(input).toBeChecked();
        } else {
          expect(input).not.toBeChecked();
        }

        await user.click(screen.getByLabelText(mock.label));
        if (checked) {
          expect(onChangeValue).not.toHaveBeenCalled();
        } else {
          expect(onChangeValue).toHaveBeenCalled();
        }
      } else {
        expect(content).toBeDisabled();
      }
    });
  });
});
