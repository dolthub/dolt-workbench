import { ModalOuter } from "@components/Modal";
import { Button, Loader } from "@dolthub/react-components";
import { ApolloErrorType } from "@lib/errors/types";
import { database } from "@lib/urls";
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import cx from "classnames";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import InnerModal from "./InnerModal";
import css from "./index.module.css";

type Props = {
  buttonClassName?: string;
  name: "database" | "schema";
  create: (name: string) => Promise<{ success: boolean }>;
  loading: boolean;
  err?: ApolloErrorType;
  setErr: (err: ApolloErrorType) => void;
};

export default function CreateDatabaseOrSchema(props: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [databaseName, setDatabaseName] = useState("");

  const onClose = () => {
    setIsOpen(false);
    props.setErr(undefined);
    setDatabaseName("");
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const { success } = await props.create(databaseName);
    if (!success) return;
    const { href, as } = database({ databaseName });
    router.push(href, as).catch(console.error);
  };

  return (
    <div>
      <Loader loaded={!props.loading} />
      <Button.Link
        onClick={() => setIsOpen(true)}
        className={cx(css.createDB, props.buttonClassName)}
      >
        <AiOutlinePlus /> Create {props.name}
      </Button.Link>
      <ModalOuter
        isOpen={isOpen}
        onRequestClose={onClose}
        title={`Create new ${props.name}`}
      >
        <InnerModal
          {...props}
          onClose={onClose}
          onSubmit={onSubmit}
          databaseName={databaseName}
          setDatabaseName={setDatabaseName}
          err={props.err}
          name={props.name}
        />
      </ModalOuter>
    </div>
  );
}
