import Modal from "@components/Modal";
import DocsLink from "@components/links/DocsLink";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button, FormInput, Loader } from "@dolthub/react-components";
import { ModalProps } from "@lib/modalProps";
import { DatabaseParams } from "@lib/params";
import dynamic from "next/dynamic";
import { SyntheticEvent, useState } from "react";
import css from "./index.module.css";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

type Props = {
  params: DatabaseParams & { refName?: string };
  query: string;
} & ModalProps;

export default function CreateViewModal({
  setIsOpen,
  ...props
}: Props): JSX.Element {
  const { executeQuery, error } = useSqlEditorContext("Views");
  const [name, setName] = useState("your_name_here");
  const [loading, setLoading] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    await executeQuery({
      ...props.params,
      query: `CREATE VIEW \`${name}\` AS ${props.query}`,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit}>
      <Modal
        isOpen={props.isOpen}
        onRequestClose={onClose}
        title="Create view"
        button={
          <Button
            disabled={!name}
            type="submit"
            data-cy="modal-create-view-button"
          >
            Create
          </Button>
        }
        err={error}
      >
        <Loader loaded={!loading} />
        <p>
          Learn more about views{" "}
          <DocsLink systemTableType="schemas">here</DocsLink>.
        </p>
        <div className={css.query}>
          <div className={css.label}>Query</div>
          <AceEditor
            className="ace-view"
            value={`CREATE VIEW \`${name}\` AS ${props.query}`}
            name="AceViewer"
            fontSize={13}
            readOnly
            wrapEnabled
            showGutter={false}
            maxLines={6}
          />
        </div>
        <FormInput
          label="Name"
          placeholder="Name your view"
          value={name}
          onChangeString={setName}
          data-cy="query-name"
          light
        />
      </Modal>
    </form>
  );
}
