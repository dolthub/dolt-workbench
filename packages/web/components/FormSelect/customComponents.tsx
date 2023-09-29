import { AiFillCaretDown } from "@react-icons/all-files/ai/AiFillCaretDown";
import { GroupBase } from "react-select";
import { SelectComponents } from "react-select/dist/declarations/src/components";
import css from "./index.module.css";

function Dropdown() {
  return <AiFillCaretDown className={css.dropdownIndicator} />;
}

type Components<Option, IsMulti extends boolean> =
  | Partial<SelectComponents<Option, IsMulti, GroupBase<Option>>>
  | undefined;

export function getComponents<Option, IsMulti extends boolean>(
  components?: Components<Option, IsMulti>,
): Components<Option, IsMulti> {
  return {
    ...components,
    IndicatorSeparator: () => null,
    DropdownIndicator: Dropdown,
  };
}
