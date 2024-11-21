import {
  DatabaseConnection,
  DatabaseConnectionFragment,
  DatabaseType,
} from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import cx from "classnames";
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import Link from "@components/links/Link";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { Button } from "@dolthub/react-components";
import css from "./index.module.css";
import { useState } from "react";
import useSelectedConnection from "./useSelectedConnection";
import CreateDatabase from "@components/CreateDatabase";

type Props = {
  params: DatabaseParams;
  currentConnection?: DatabaseConnection | null;
};

export default function Inner(props: Props) {
  const { onSelected, databases, storedConnections } = useSelectedConnection();

  return (
    <div className={css.container}>
      <div className={css.top}>
        <div className={cx(css.header, css.left)}>
          <span>CONNECTIONS</span>
          <Link href="/connections">
            <FiPlus />
          </Link>
        </div>
        <div className={cx(css.header, css.right)}>
          <span>DATABASES</span>
          <CreateDatabase isPostgres={props.currentConnection?.type===DatabaseType.Postgres}/>
        </div>
      </div>
      <div className={css.bottom}>
        <div className={css.left}>
          {storedConnections.map((conn, i) => (
            <Button.Link
              key={i}
              className={css.connection}
              onClick={() => onSelected(conn)}
            >
              <span>{conn.name}</span>
              <FaChevronRight />
            </Button.Link>
          ))}
          <Link href="/connections" className={css.manageConnection}>
            manage
          </Link>
        </div>
        <div className={css.right}>
          {databases.map((db, i) => (
            <Button.Link key={i} className={css.connection}>
              <span>{db}</span>
              <FaChevronRight />
            </Button.Link>
          ))}
        </div>
      </div>
    </div>
  );
}
