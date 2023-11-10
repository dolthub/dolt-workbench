import customStyles from "@lib/selectStyles";
import cx from "classnames";
import React from "react";
import Select from "react-select";
import { getComponents } from "./customComponents";
import css from "./index.module.css";
import { Option, OptionWithDetails, Props } from "./types";
import {
  getOnChange,
  getValue,
  getValueForOptions,
  moveSelectedToTop,
} from "./utils";

/*
This custom FormSelect component is simplified to accept values/onChange arguments that represent the `value` field on an `OptionType`.

For example, instead of using the full OptionType as a value (i.e. value={ value: "Taylor", label: "Name" }) we can just use the string "Taylor" and the `getValueForOptions` finds the matching `OptionType` within the provided `options`. A custom `getValueForOptions` function can be provided using the `getValFunc` prop.

It has also been adjusted to accept values other than strings, like numbers, enums, etc.
*/
export default function FormSelect({
  mono = false,
  light = false,
  small = false,
  horizontal = false,
  selectedOptionFirst: selectedFirst = false,
  pill = false,
  transparentBorder = false,
  ...props
}: Props<Option>): JSX.Element {
  const styles = customStyles<Option>(
    mono,
    light,
    small,
    pill,
    transparentBorder,
  );

  const options =
    selectedFirst && !props.hideSelectedOptions
      ? moveSelectedToTop(props.val, props.options)
      : props.options;
  return (
    <div
      className={cx(props.outerClassName, {
        [css.horizontal]: horizontal,
      })}
      data-cy={props["data-cy"]}
    >
      {props.label && (
        <div
          className={cx(
            css.label,
            { [css.horizontalLabel]: horizontal },
            props.labelClassName,
          )}
        >
          {props.label}
        </div>
      )}
      <Select
        {...props}
        options={options}
        onChange={getOnChange<Option>(props.onChangeValue)}
        value={getValue(props, options)}
        styles={{ ...styles, ...props.styles }}
        components={getComponents(props.components)}
      />
    </div>
  );
}

function WithOptionDetails({
  mono = false,
  light = false,
  small = false,
  selectedOptionFirst: selectedFirst = false,
  ...props
}: Props<OptionWithDetails>) {
  const styles = customStyles<OptionWithDetails>(mono, light, small);
  const options =
    selectedFirst && !props.hideSelectedOptions
      ? moveSelectedToTop(props.val, props.options)
      : props.options;
  return (
    <div className={props.outerClassName} data-cy={props["data-cy"]}>
      {props.label && <div className={css.label}>{props.label}</div>}
      <Select
        {...props}
        options={options}
        onChange={getOnChange<OptionWithDetails>(props.onChangeValue)}
        value={getValueForOptions<OptionWithDetails>(
          props.val,
          options,
          props.getValFunc,
        )}
        styles={{ ...styles, input: styles.input }}
        formatOptionLabel={formatOptionLabel}
        components={getComponents(props.components)}
      />
    </div>
  );
}

FormSelect.WithOptionDetails = WithOptionDetails;

function formatOptionLabel(
  option: OptionWithDetails,
): React.DetailedReactHTMLElement<Record<string, unknown>, HTMLElement> {
  return React.createElement(
    "div",
    {},
    <span>
      <span>{option.label}</span>
      <span>{option.details}</span>
    </span>,
  );
}

function WithMulti({
  mono = false,
  light = false,
  small = false,
  horizontal = false,
  selectedOptionFirst: selectedFirst = false,
  isMulti = true,
  ...props
}: Props<Option, true>): JSX.Element {
  const styles = props.styles || customStyles<Option, true>(mono, light, small);

  const options =
    selectedFirst && !props.hideSelectedOptions
      ? moveSelectedToTop(props.val, props.options)
      : props.options;

  return (
    <div
      className={cx(props.outerClassName, {
        [css.horizontal]: horizontal,
      })}
    >
      {props.label && <div className={css.label}>{props.label}</div>}
      <Select
        {...props}
        isMulti={isMulti}
        options={options}
        onChange={(opts: readonly Option[]) => {
          props.onChangeValue(opts.map(o => o.value));
        }}
        value={getValueForOptions<Option>(props.val, options, props.getValFunc)}
        styles={{ ...styles, input: styles.input }}
        components={getComponents(props.components)}
      />
    </div>
  );
}

FormSelect.WithMulti = WithMulti;

function WithIcon({
  mono = false,
  light = false,
  small = false,
  selectedOptionFirst: selectedFirst = false,
  ...props
}: Props<OptionWithDetails>) {
  const styles = customStyles<OptionWithDetails>(mono, light, small);
  const options =
    selectedFirst && !props.hideSelectedOptions
      ? moveSelectedToTop(props.val, props.options)
      : props.options;
  return (
    <Select
      {...props}
      options={options}
      onChange={getOnChange<OptionWithDetails>(props.onChangeValue)}
      value={getValueForOptions<OptionWithDetails>(
        props.val,
        options,
        props.getValFunc,
      )}
      styles={{ ...styles, input: styles.input }}
      formatOptionLabel={formatOptionIcon}
      components={getComponents(props.components)}
    />
  );
}

FormSelect.WithIcon = WithIcon;

function formatOptionIcon(
  option: OptionWithDetails,
): React.DetailedReactHTMLElement<Record<string, unknown>, HTMLElement> {
  return React.createElement(
    "div",
    {},
    <span>
      {option.details}
      <span>{option.label}</span>
    </span>,
  );
}

export * from "./types";
