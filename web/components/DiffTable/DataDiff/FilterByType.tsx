import { FormSelect } from "@dolthub/react-components";
import { DiffRowType } from "@gen/graphql-types";
import css from "./index.module.css";

type Props = {
  filter?: DiffRowType;
  setFilter: (f?: DiffRowType) => void;
};

export default function FilterByType(props: Props) {
  return (
    <FormSelect
      className={css.filterSelect}
      labelClassName={css.filterLabel}
      label="Filter by"
      val={props.filter}
      options={[
        { label: "Added", value: DiffRowType.Added },
        { label: "Removed", value: DiffRowType.Removed },
        { label: "Modified", value: DiffRowType.Modified },
      ]}
      onChangeValue={props.setFilter}
      placeholder="all changes"
      hideSelectedOptions
      isClearable
      horizontal
      light
      mono
      small
    />
  );
}
