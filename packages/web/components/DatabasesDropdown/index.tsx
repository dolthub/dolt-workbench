import ButtonWithPopup from "@components/ButtonWithPopup";
import CreateDatabase from "@components/CreateDatabase";
import Link from "@components/links/Link";
import { useDatabasesQuery } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import { database } from "@lib/urls";
import cx from "classnames";
import { useState } from "react";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
};

type InnerProps = Props & {
  databases: string[];
};

function Inner(props: InnerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filtered = props.databases.filter(
    db => db !== props.params.databaseName,
  );
  return (
    <span className={css.wrapper}>
      <ButtonWithPopup
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        position="bottom left"
        offsetX={0}
        contentStyle={{ width: "8rem", padding: 0 }}
        arrow={false}
      >
        <ul>
          {filtered.map(db => (
            <li key={db} className={css.dbItem}>
              <Link {...database({ ...props.params, databaseName: db })}>
                {db}
              </Link>
            </li>
          ))}
          <li>
            <CreateDatabase
              {...props}
              buttonClassName={cx(css.createDBButton, {
                [css.roundTop]: !filtered.length,
              })}
            />
          </li>
        </ul>
      </ButtonWithPopup>
    </span>
  );
}

export default function DatabasesDropdown(props: Props) {
  const res = useDatabasesQuery();
  if (res.loading || res.error || !res.data) return null;
  return <Inner {...props} databases={res.data.databases} />;
}
