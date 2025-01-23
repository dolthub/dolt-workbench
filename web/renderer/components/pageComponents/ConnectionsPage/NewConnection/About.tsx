import {
  Button,
  FormInput,
  FormSelect,
  useTabsContext,
} from "@dolthub/react-components";
import { DatabaseType } from "@gen/graphql-types";
import { useConfigContext } from "./context/config";
import css from "./index.module.css";

export default function About() {
  const { state, setState } = useConfigContext();
  const { activeTabIndex, setActiveTabIndex } = useTabsContext();

  const onNext = () => {
    setActiveTabIndex(activeTabIndex + 1);
  };

  return (
    <form onSubmit={onNext} className={css.form}>
      <FormInput
        value={state.name}
        onChangeString={n => setState({ name: n })}
        label="Name"
        labelClassName={css.label}
        placeholder="my-database (required)"
        light
      />
      <FormSelect
        outerClassName={css.typeSelect}
        className={css.typeSelectInner}
        labelClassName={css.label}
        label="Type"
        val={state.type}
        onChangeValue={t => {
          if (!t) return;
          setState({
            type: t,
            port: t === DatabaseType.Mysql ? "3306" : "5432",
            username: t === DatabaseType.Mysql ? "root" : "postgres",
          });
        }}
        options={[
          { label: "MySQL/Dolt", value: DatabaseType.Mysql },
          {
            label: "Postgres/Doltgres",
            value: DatabaseType.Postgres,
          },
        ]}
        hideSelectedOptions
        light
      />
      <Button type="submit" disabled={!state.name} className={css.button}>
        Next
      </Button>
    </form>
  );
}
