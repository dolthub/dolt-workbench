import CustomRadio from "@components/CustomRadio";
import HelpPopup from "@components/HelpPopup";
import ExternalLink from "@components/links/ExternalLink";
import { LoadDataModifier } from "@gen/graphql-types";
import { useFileUploadContext } from "./contexts/fileUploadLocalForage";
import css from "./index.module.css";

type Props = {
  forSpreadsheet?: boolean;
};

export default function LoadDataInfo(props: Props) {
  return (
    <div>
      <div className={css.loadData}>
        <p>
          Uses{" "}
          <ExternalLink href="https://dev.mysql.com/doc/refman/8.0/en/load-data.html">
            LOAD DATA
          </ExternalLink>{" "}
          to{" "}
          {props.forSpreadsheet
            ? "insert spreadsheet rows"
            : "read rows from a file"}{" "}
          into the selected table.
        </p>{" "}
        <HelpPopup popupProps={{ contentStyle: { width: "22rem" } }}>
          <div className={css.loadHelp}>
            Current requirements:
            <ul>
              <li>Must have header row</li>
              <li>Column count and type must match table</li>
            </ul>
          </div>
        </HelpPopup>
      </div>
      <ModifierOptions />
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
        <CustomRadio
          name="ignore"
          checked={!state.modifier}
          onChange={() => setState({ modifier: undefined })}
        >
          IGNORE
        </CustomRadio>
        <HelpPopup className={css.radioHelp}>
          With IGNORE, new rows that duplicate an existing row on a unique key
          value are discarded. This is the default behavior.{" "}
          <ExternalLink href="https://dev.mysql.com/doc/refman/8.0/en/sql-mode.html#ignore-effect-on-execution">
            See more information.
          </ExternalLink>
        </HelpPopup>
        <CustomRadio
          name="replace"
          checked={state.modifier === LoadDataModifier.Replace}
          onChange={() => setState({ modifier: LoadDataModifier.Replace })}
        >
          REPLACE
        </CustomRadio>
        <HelpPopup className={css.radioHelp}>
          With REPLACE, new rows that have the same value as a unique key value
          in an existing row replace the existing row.{" "}
          <ExternalLink href="https://dev.mysql.com/doc/refman/8.0/en/replace.html">
            See more information.
          </ExternalLink>
        </HelpPopup>
      </div>
    </div>
  );
}
