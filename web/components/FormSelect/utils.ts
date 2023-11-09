import {
  GroupBase,
  OnChangeValue,
  OptionsOrGroups,
  PropsValue,
} from "react-select";
import { OnChange, Option, OptionTypeBase, Props } from "./types";

// Converts custom onChangeValue function to onChange function for react-select
export function getOnChange<OptionType extends OptionTypeBase>(
  onChangeValue: (e: any) => void,
): OnChange<OptionType> | undefined {
  return (e: OnChangeValue<OptionType, false>) => {
    if (!e) {
      onChangeValue(null);
      return;
    }
    onChangeValue((e as OptionType).value);
  };
}

// Searches options array for OptionType that matches val. If provided, uses
// `getValFunc` for matching. The default matching function checks for val ===
// option.value
export function getValueForOptions<OptionType extends OptionTypeBase>(
  val: any | null,
  options: OptionType[],
  getValFunc?: (o: any, v: any) => boolean,
): OptionType | null {
  const equal = (o: any, v: any): boolean => {
    if (getValFunc) {
      return getValFunc(o, v);
    }
    return o === v;
  };
  return val !== undefined && val !== null
    ? options[options.findIndex(x => equal(x.value, val))]
    : null;
}

export function getValue(
  props: Props<Option>,
  options: OptionsOrGroups<Option, GroupBase<Option>> & Option[],
): PropsValue<Option> | undefined {
  const valueFromOptions = getValueForOptions<Option>(
    props.val,
    options,
    props.getValFunc,
  );

  if (props.useValueAsSingleValue && props.val) {
    return { value: props.val, label: props.val };
  }

  return valueFromOptions;
}

// Given a value that is currently selected and a list of all options,
// move the selected option (determined by value) to the top of the list.
export function moveSelectedToTop<OptionType extends OptionTypeBase>(
  selectedVal: any | null,
  options: OptionType[],
): OptionType[] {
  if (!selectedVal) {
    return options;
  }

  const i = options.findIndex(({ value }) => value === selectedVal);
  // If no value was found for the given selected value, return the original array.
  if (i < 0) {
    return options;
  }
  const selectedOption = options[i];
  const optionsCopy = [...options];
  optionsCopy.splice(i, 1);
  optionsCopy.unshift(selectedOption);
  return optionsCopy;
}
