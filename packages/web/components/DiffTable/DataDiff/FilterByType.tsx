import { DiffRowType } from "@gen/graphql-types";
import FormSelect from "@components/FormSelect";
import css from "./index.module.css";

type Props = {
  filter?: DiffRowType;
  setFilter: (f?: DiffRowType) => void;
};

export default function FilterByType(props: Props) {
  return (
    <div className={css.filterContainer} data-cy="filter-by-diff-type">
      <span>Filter by</span>
      <div className={css.filterSelect}>
        <FormSelect
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
          light
          mono
          small
        />
      </div>
    </div>
  );
}
