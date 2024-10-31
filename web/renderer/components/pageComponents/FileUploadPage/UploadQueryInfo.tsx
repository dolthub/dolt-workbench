import { ExternalLink, HelpPopup, Radio } from "@dolthub/react-components";
import { LoadDataModifier } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { useFileUploadContext } from "./contexts/fileUploadLocalForage";
import css from "./index.module.css";

type Props = {
  forSpreadsheet?: boolean;
  hideModifierOptions?: boolean;
  tableName: string;
};

export default function UploadQueryInfo(props: Props) {
  const { isPostgres } = useDatabaseDetails();
  return (
    <div>
      <div className={css.loadData}>
        <p>
          Uses{" "}
          {isPostgres ? (
            <ExternalLink href="https://www.postgresql.org/docs/current/sql-copy.html">
              COPY FROM
            </ExternalLink>
          ) : (
            <ExternalLink href="https://dev.mysql.com/doc/refman/8.0/en/load-data.html">
              LOAD DATA
            </ExternalLink>
          )}{" "}
          to{" "}
          {props.forSpreadsheet
            ? "insert spreadsheet rows"
            : "read rows from a file"}{" "}
          into the <span className={css.bold}>{props.tableName}</span> table.
        </p>{" "}
        <HelpPopup popupProps={{ contentStyle: { width: "22rem" } }}>
          <div className={css.loadHelp}>
            Current requirements:
            <ul>
              <li>Must have header row</li>
              <li>Column count and type must match table</li>
              {isPostgres && <li>Will fail on duplicate keys</li>}
            </ul>
          </div>
        </HelpPopup>
      </div>
      {!isPostgres && !props.hideModifierOptions && <ModifierOptions />}
    </div>
  );
}

function ModifierOptions() {
  const { state, setState } = useFileUploadContext();
  return (
    <div>
      <p>
        How would you like to handle{" "}
        <ExternalLink href="https://dev.mysql.com/doc/refman/8.0/en/load-data.html#load-data-error-handling">
          duplicate keys
        </ExternalLink>
        ?
      </p>
      <div className={css.modifierOptions}>
        <div>
          <Radio
            name="ignore"
            checked={!state.modifier}
            onChange={() => setState({ modifier: undefined })}
            label="IGNORE"
          />
          <HelpPopup className={css.radioHelp}>
            With IGNORE, new rows that duplicate an existing row on a unique key
            value are discarded. This is the default behavior.{" "}
            <ExternalLink href="https://dev.mysql.com/doc/refman/8.0/en/sql-mode.html#ignore-effect-on-execution">
              See more information.
            </ExternalLink>
          </HelpPopup>
        </div>
        <div>
          <Radio
            name="replace"
            checked={state.modifier === LoadDataModifier.Replace}
            onChange={() => setState({ modifier: LoadDataModifier.Replace })}
            label="REPLACE"
          />
          <HelpPopup className={css.radioHelp}>
            With REPLACE, new rows that have the same value as a unique key
            value in an existing row replace the existing row.{" "}
            <ExternalLink href="https://dev.mysql.com/doc/refman/8.0/en/replace.html">
              See more information.
            </ExternalLink>
          </HelpPopup>
        </div>
      </div>
    </div>
  );
}
