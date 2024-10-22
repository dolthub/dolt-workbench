import { sampleCreateQueryForEmpty } from "@components/DatabaseTableHeader/useSqlStrings";
import Link from "@components/links/Link";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import { database } from "@lib/urls";
import { AiOutlineCode } from "@react-icons/all-files/ai/AiOutlineCode";
import cx from "classnames";
import css from "./ForCreateTable/index.module.css";
import OptionSquare from "./ForTable/OptionSquare";

type Props = {
  params: OptionalRefParams;
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
      <HideForNoWritesWrapper
        params={props.params}
        noWritesAction="update data using the workbench"
      >
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
      </HideForNoWritesWrapper>
      <Link {...database(props.params)}>
        <Button.Link
          underlined
          className={cx(css.cancel, {
            [css.removeForGetStarted]: props.getStarted,
          })}
        >
          Cancel
        </Button.Link>
      </Link>
    </div>
  );
}
