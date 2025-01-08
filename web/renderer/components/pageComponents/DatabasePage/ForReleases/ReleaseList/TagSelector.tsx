import { FormSelect } from "@dolthub/react-components";
import { TagForListFragment } from "@gen/graphql-types";
import css from "./index.module.css";

type Props = {
  tags: TagForListFragment[];
  onChange: (t: string) => void;
  val: string;
  label: string;
};

export default function TagSelector(props: Props) {
  return (
    <FormSelect
      options={props.tags.map(t => {
        return {
          value: t.tagName,
          label: t.tagName,
        };
      })}
      val={props.val}
      onChangeValue={t => props.onChange(t || "")}
      hideSelectedOptions
      className={css.selector}
      label={props.label}
      horizontal
    />
  );
}
