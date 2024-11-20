import Item from "@components/pageComponents/ConnectionsPage/ExistingConnections/Item";
import { DatabaseConnection } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import { Button } from "@dolthub/react-components";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import CreateDatabase from "@components/CreateDatabase";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  storedConnections: DatabaseConnection[];
  params: DatabaseParams;
  currentConnection?: DatabaseConnection | null;
  databases: string[] | undefined;
};

export default function Inner(props: Props) {
 
  return (
    <div>
      <div>
        <ul>
          {props.storedConnections.map(connection => (
            <Item conn={connection} key={connection.name} />
          ))}
        </ul>
      </div>
      <div>
        {/* <ul>
          {databases?.map(db => (
            <li key={db} className={css.dbItem}>
              <Button.Link onClick={async () => resetDatabase(db)}>
                {db}
              </Button.Link>
            </li>
          ))}
          <HideForNoWritesWrapper params={props.params}>
            <li>
              <CreateDatabase
                {...props}
                isPostgres={isPostgres}
                buttonClassName={cx(css.createDBButton, {
                  [css.roundTop]: !databases?.length,
                })}
              />
            </li>
          </HideForNoWritesWrapper>
        </ul> */}
      </div>
    </div>
  );
}
