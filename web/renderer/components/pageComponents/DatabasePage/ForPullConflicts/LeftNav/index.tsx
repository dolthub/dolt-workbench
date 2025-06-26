import Link from "@components/links/Link";
import { QueryHandler } from "@dolthub/react-components";
import { formatNumber } from "@dolthub/web-utils";
import { PullDiffParams } from "@lib/params";
import { pullConflicts } from "@lib/urls";
import { GiHamburgerMenu } from "@react-icons/all-files/gi/GiHamburgerMenu";
import cx from "classnames";
import { useState } from "react";
import { useConflictsContext } from "../contexts/conflicts";
import css from "./index.module.css";

type Props = {
  params: PullDiffParams;
  tableName?: string;
};

export default function LeftNav(props: Props) {
  const [open, setOpen] = useState(true);
  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <div
      className={cx(
        css.container,
        css[open ? "openContainer" : "closedContainer"],
      )}
    >
      <div className={css.top}>
        <h4>Conflicted Tables</h4>
        <GiHamburgerMenu onClick={toggleMenu} className={css.menuIcon} />
      </div>
      <div className={css[open ? "openItem" : "closedItem"]}>
        <Inner {...props} />
      </div>
    </div>
  );
}

function Inner(props: Props) {
  const { loading, error, conflictsSummary, activeTableName } =
    useConflictsContext();

  return (
    <QueryHandler
      result={{ loading, error, data: { conflictsSummary } }}
      render={data => (
        <table className={css.table}>
          <thead>
            <tr>
              <th>Table</th>
              <th>Data Conflicts</th>
              <th>Schema Conflicts</th>
            </tr>
          </thead>
          <tbody>
            {data.conflictsSummary?.map(s => (
              <tr>
                <td>
                  {s.tableName === activeTableName ? (
                    <span className={css.activeTableName}>{s.tableName}</span>
                  ) : (
                    <Link
                      {...pullConflicts({
                        ...props.params,
                        tableName: s.tableName,
                      })}
                    >
                      {s.tableName}
                    </Link>
                  )}
                </td>
                <td>
                  {s.numDataConflicts === null ||
                  s.numDataConflicts === undefined
                    ? "-"
                    : formatNumber(s.numDataConflicts)}
                </td>
                <td>{formatNumber(s.numSchemaConflicts ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    />
  );
}
