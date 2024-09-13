import { FormSelect } from "@dolthub/react-components";
import { splitEnumOptions } from "@lib/dataTable";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  currColType: string;
  isNull: boolean;
  newValue: string;
  setNewValue: (v: string) => void;
  showTextarea: boolean;
  inputType: string;
  largerMarginRight?: boolean;
};

export default function Input(props: Props) {
  const placeholder = props.isNull ? "NULL" : "Enter value";
  if (
    props.showTextarea ||
    props.inputType === "textarea" ||
    props.inputType === "json"
  ) {
    return (
      <textarea
        value={props.newValue}
        className={cx(css.editInput, css.editTextarea, {
          [css.largerMarginRight]: props.largerMarginRight,
        })}
        onChange={e => props.setNewValue(e.target.value)}
        placeholder={placeholder}
        rows={5}
      />
    );
  }

  if (props.inputType === "dropdown") {
    return (
      <FormSelect
        val={props.newValue}
        options={splitEnumOptions(props.currColType).map(t => {
          return {
            label: t,
            value: t,
          };
        })}
        onChangeValue={v => props.setNewValue(v ?? "")}
        outerClassName={css.editSelect}
        mono
        small
        customStyles={s => {
          return {
            ...s,
            singleValue: styles => {
              return { ...styles, marginBottom: "6px" };
            },
          };
        }}
      />
    );
  }

  if (props.inputType === "datetime") {
    const [date, time] = props.newValue.split(" ");
    const className = cx(css.editInput, css.datetimeInput, {
      [css.largerMarginRight]: props.largerMarginRight,
    });
    return (
      <span>
        <input
          type="date"
          value={date}
          onChange={e => props.setNewValue(`${e.target.value} ${time}`)}
          placeholder={placeholder}
          className={className}
        />
        <input
          type="time"
          value={time}
          onChange={e => props.setNewValue(`${date} ${e.target.value}`)}
          placeholder={placeholder}
          step="1"
          className={cx(css.editInput, {
            [css.largerMarginRight]: props.largerMarginRight,
          })}
        />
      </span>
    );
  }

  if (props.inputType === "bit(1)") {
    return (
      <input
        type="checkbox"
        name="bitValue"
        value="1"
        checked={props.newValue !== "" && !!parseInt(props.newValue, 2)}
        onChange={() =>
          props.setNewValue(
            !parseInt(props.newValue, 2) || props.newValue === "" ? "1" : "0",
          )
        }
      />
    );
  }

  return (
    <input
      className={cx(css.editInput, {
        [css.largerMarginRight]: props.largerMarginRight,
      })}
      type={props.inputType}
      placeholder={placeholder}
      step="1"
      value={props.newValue}
      onChange={e => props.setNewValue(e.target.value)}
    />
  );
}
