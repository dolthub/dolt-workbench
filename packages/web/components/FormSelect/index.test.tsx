import randomArrayItem from "@lib/randomArrayItem";
import {
  fireEvent,
  queryByAttribute,
  render,
  screen,
} from "@testing-library/react";
import selectEvent from "react-select-event";
import FormSelect from "./index";
import { Option } from "./types";

const optionWithoutIconPath: Option[] = [...Array(5).keys()].map(i => {
  return {
    label: `test${i}`,
    value: `test${i}`,
  };
});

const mocks = [{ options: optionWithoutIconPath }];

describe("test FormSelect", () => {
  mocks.forEach(mock => {
    it("it renders component and is clickable", async () => {
      const onChangeValue = jest.fn();
      render(
        <FormSelect
          options={mock.options}
          val=""
          onChangeValue={onChangeValue}
        />,
      );

      // expand the options
      fireEvent.mouseDown(screen.getByRole("combobox"));
      mock.options.forEach(option => {
        expect(screen.getByText(option.value)).toBeVisible();
      });

      // click new value
      await selectEvent.select(
        screen.getByText(mock.options[0].value),
        mock.options[1].value,
      );

      // check that onChangeValue has been called
      expect(onChangeValue).toHaveBeenCalled();
      fireEvent.mouseDown(screen.getByRole("combobox"));
    });

    it("shows the selected option first if selectedOptionFirst is true", async () => {
      const selected = randomArrayItem(mock.options);
      const { container } = render(
        <FormSelect
          options={mock.options}
          val={selected.value}
          selectedOptionFirst
          onChangeValue={() => {}}
        />,
      );

      // expand the options
      fireEvent.mouseDown(screen.getByRole("combobox"));

      // Difficult to get the inner MenuList by anything else
      const menuList = queryByAttribute("class", container, /MenuList/);
      if (!menuList) {
        throw Error("MenuList not found");
      }
      expect(menuList.firstElementChild).toHaveTextContent(selected.value);
    });
  });
});
