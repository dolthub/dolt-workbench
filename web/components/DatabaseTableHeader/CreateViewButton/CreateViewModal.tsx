import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import FormInput from "@components/FormInput";
import Loader from "@components/Loader";
import Modal from "@components/Modal";
import DocsLink from "@components/links/DocsLink";
import { useSqlEditorContext } from "@contexts/sqleditor";
import useSqlBuilder from "@hooks/useSqlBuilder";
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
  const { createView } = useSqlBuilder();
  const [name, setName] = useState("your_name_here");
  const [loading, setLoading] = useState(false);
  const query = createView(name, props.query);

  const onClose = () => {
    setIsOpen(false);
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    await executeQuery({
      ...props.params,
      query,
    });
    setLoading(false);
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={onClose}
      title="Create view"
      className={css.modal}
    >
      <p>
        Learn more about views{" "}
        <DocsLink systemTableType="schemas">here</DocsLink>.
      </p>
      <Loader loaded={!loading} />
      <form onSubmit={onSubmit}>
        <div className={css.query}>
          <div className={css.label}>Query</div>
          <AceEditor
            value={query}
            name="AceViewer"
            fontSize={13}
            readOnly
            wrapEnabled
            showGutter={false}
            maxLines={6}
            light
          />
        </div>
        <FormInput
          label="Name"
          placeholder="Name your view"
          value={name}
          onChangeString={setName}
          data-cy="query-name"
        />
        <ButtonsWithError onCancel={onClose} error={error}>
          <Button
            disabled={!name}
            type="submit"
            data-cy="modal-create-view-button"
          >
            Create
          </Button>
        </ButtonsWithError>
      </form>
    </Modal>
  );
}
