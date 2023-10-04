import FormSelect from "@components/FormSelect";
import cx from "classnames";
import css from "./index.module.css";
import { getComponents } from "./selectorComponents";
import { FormSelectorProps } from "./types";

export default function Selector(props: FormSelectorProps) {
  const dataCy = props.dataCySuffix ?? "";
  return (
    <div className={cx(css.container, props.className)}>
      {props.showLabel && <span className={css.label}>{props.label}</span>}
      <div
        className={cx(css.dropdown, {
          [css.customDropdown]: props.customDropdown,
        })}
        data-cy="selector-id-show-tabs"
      >
        <div className={css.splitByWord}>
          <FormSelect
            {...props}
            data-cy={`selector${dataCy}`}
            val={props.val}
            selectedOptionFirst
            openMenuOnFocus={props.autoFocus}
            components={getComponents(props)}
            label={undefined}
            noOptionsMessage={getNoOptions(dataCy, props.noneFoundMsg)}
          />
        </div>
      </div>
    </div>
  );
}

function getNoOptions(dataCy: string, noneFoundMsg?: string) {
  // eslint-disable-next-line react/display-name
  return function () {
    return (
      <p data-cy={`none-found${dataCy}`}>
        {noneFoundMsg ?? "No options found"}
      </p>
    );
  };
}
