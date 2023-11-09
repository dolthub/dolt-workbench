import { AiFillCaretDown } from "@react-icons/all-files/ai/AiFillCaretDown";
import { GroupBase, SelectComponentsConfig } from "react-select";
import css from "./index.module.css";

function Dropdown() {
  return <AiFillCaretDown className={css.dropdownIndicator} />;
}

type Components<Option, IsMulti extends boolean> =
  | Partial<SelectComponentsConfig<Option, IsMulti, GroupBase<Option>>>
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
