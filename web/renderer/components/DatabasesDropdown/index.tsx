import CreateDatabase from "@components/CreateDatabase";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import {
  Button,
  ButtonWithPopup,
  ErrorMsg,
  Loader,
} from "@dolthub/react-components";
import {
  useDatabasesQuery,
  useResetDatabaseMutation,
} from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import useMutation from "@hooks/useMutation";
import { DatabaseParams } from "@lib/params";
import { database } from "@lib/urls";
import cx from "classnames";
import { useRouter } from "next/router";
import { useState } from "react";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
};

type InnerProps = Props & {
  databases: string[];
  isPostgres: boolean;
};

function Inner(props: InnerProps) {
  const {
    mutateFn: resetDB,
    loading,
    err,
  } = useMutation({
    hook: useResetDatabaseMutation,
  });
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const filtered = props.databases.filter(
    db => db !== props.params.databaseName,
  );

  const onClick = async (databaseName: string) => {
    if (props.isPostgres) {
      await resetDB({ variables: { newDatabase: databaseName } });
    }
    const { href, as } = database({ ...props.params, databaseName });
    router.push(href, as).catch(console.error);
  };

  return (
    <span className={css.wrapper}>
      <Loader loaded={!loading} />
      <ButtonWithPopup
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        position="bottom left"
        offsetX={0}
        contentStyle={{ width: "auto", padding: 0 }}
        arrow={false}
      >
        <ul>
          {filtered.map(db => (
            <li key={db} className={css.dbItem}>
              <Button.Link onClick={async () => onClick(db)}>{db}</Button.Link>
            </li>
          ))}
          <HideForNoWritesWrapper params={props.params}>
            <li>
              <CreateDatabase
                {...props}
                connectionName={props.params.connectionName}
                buttonClassName={cx(css.createDBButton, {
                  [css.roundTop]: !filtered.length,
                })}
                showText
              />
            </li>
          </HideForNoWritesWrapper>
        </ul>
      </ButtonWithPopup>
      <ErrorMsg err={err} />
    </span>
  );
}

export default function DatabasesDropdown(props: Props) {
  const res = useDatabasesQuery({
    variables: props.params,
  });
  const dbDetails = useDatabaseDetails(props.params.connectionName);
  if (res.loading || dbDetails.loading || res.error || !res.data) return null;
  return (
    <Inner
      {...props}
      databases={res.data.databases}
      isPostgres={dbDetails.isPostgres}
    />
  );
}
