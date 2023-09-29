import Button from "@components/Button";
import { sampleCreateQueryForEmpty } from "@components/DatabaseTableHeader/utils";
import Link from "@components/links/Link";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { database } from "@lib/urls";
import { AiOutlineCode } from "@react-icons/all-files/ai/AiOutlineCode";
import cx from "classnames";
import css from "./ForCreateTable/index.module.css";
import OptionSquare from "./ForTable/OptionSquare";

type Props = {
  params: { refName?: string };
  getStarted?: boolean;
};

export default function CreateTableOptions(props: Props) {
  const { setEditorString, toggleSqlEditor } = useSqlEditorContext();

  const onWriteQuery = () => {
    setEditorString(sampleCreateQueryForEmpty());
    toggleSqlEditor(true);
  };

  return (
    <div
      className={cx(css.container, {
        [css.getStartedContainer]: props.getStarted,
      })}
    >
      <h2 className={cx({ [css.removeForGetStarted]: props.getStarted })}>
        Create a new table
      </h2>
      <div
        className={cx(css.sections, {
          [css.forGetStarted]: props.getStarted,
        })}
      >
        <OptionSquare
          icon={<AiOutlineCode />}
          link={
            <Button.Link
              onClick={onWriteQuery}
              data-cy="sql-query-create-table"
            >
              SQL Query
            </Button.Link>
          }
        />
      </div>
      <Link {...database()}>
        <Button.Underlined
          className={cx(css.cancel, {
            [css.removeForGetStarted]: props.getStarted,
          })}
        >
          Cancel
        </Button.Underlined>
      </Link>
    </div>
  );
}
