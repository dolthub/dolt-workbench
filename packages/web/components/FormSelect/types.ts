import { ReactNode } from "react";
import { ActionMeta, OnChangeValue, Props as SelectProps } from "react-select";

export interface Option {
  label: string;
  value: any;
  isDisabled?: boolean;
}

// Options rendered with details will not render an input; selection can only be made from dropdown.
export interface OptionWithDetails extends Option {
  details: ReactNode;
}

export type OnChange<OptionType> = (
  value: OnChangeValue<OptionType, false>,
  action: ActionMeta<OptionType>,
) => void;

type CustomProps<OptionType> = {
  options: OptionType[];
  val: any | null;
  label?: string;
  outerClassName?: string;
  labelClassName?: string;
  mono?: boolean;
  light?: boolean;
  small?: boolean;
  pill?: boolean;
  transparentBorder?: boolean;
  isMobile?: boolean;
  horizontal?: boolean;
  // Show the selected option first in the list
  selectedOptionFirst?: boolean;
  ["data-cy"]?: string;
  useValueAsSingleValue?: boolean;
  // onChangeValue handles updating the `val` prop (type any).
  // onChange can be used to update `value` (type OptionType).
  onChangeValue: (val: any) => void;
  // Handles getting value if value is not a string
  getValFunc?: (o: any, v: any) => boolean;
};

export type OptionTypeBase = {
  label: string;
  value: any;
};

export type Props<
  OptionType extends OptionTypeBase,
  IsMulti extends boolean = false,
> = SelectProps<OptionType, IsMulti> & CustomProps<OptionType>;
