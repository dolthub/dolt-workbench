import ButtonWithPopup from "@components/ButtonWithPopup";
import CreateSchema from "@components/CreateSchema";
import Link from "@components/links/Link";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { useDatabaseSchemasQuery } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import { database } from "@lib/urls";
import cx from "classnames";
import { useState } from "react";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
};

type InnerProps = Props & {
  schemas: string[];
};

function Inner(props: InnerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filtered = props.schemas.filter(
    sch => sch !== props.params.databaseName,
  );
  return (
    <span className={css.wrapper}>
      <ButtonWithPopup
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        position="bottom left"
        offsetX={0}
        contentStyle={{ width: "12rem", padding: 0 }}
        arrow={false}
      >
        <ul>
          {filtered.map(sch => (
            <li key={sch} className={css.schItem}>
              <Link {...database({ databaseName: sch })}>{sch}</Link>
            </li>
          ))}
          <HideForNoWritesWrapper params={props.params}>
            <li>
              <CreateSchema
                {...props}
                buttonClassName={cx(css.createButton, {
                  [css.roundTop]: !filtered.length,
                })}
              />
            </li>
          </HideForNoWritesWrapper>
        </ul>
      </ButtonWithPopup>
    </span>
  );
}

export default function SchemasDropdown(props: Props) {
  const res = useDatabaseSchemasQuery();
  if (res.loading || res.error || !res.data) return null;
  return <Inner {...props} schemas={res.data.schemas} />;
}
