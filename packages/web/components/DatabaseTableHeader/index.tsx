import css from "./index.module.css";

type Params = {
  q?: string;
  tableName?: string;
};

type Props = {
  params: Params;
  empty?: boolean;
};

export default function DatabaseTableHeader(props: Props) {
  return <div className={css.editorContainer}>Sql Editor</div>;
}
