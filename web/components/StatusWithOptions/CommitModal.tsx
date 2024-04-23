import HeaderUserCheckbox from "@components/HeaderUserCheckbox";
import { FormModal, Textarea } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import { StatusFragment } from "@gen/graphql-types";
import { useUserHeaders } from "@hooks/useUserHeaders";
import { ModalProps } from "@lib/modalProps";
import { RefParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import css from "./index.module.css";

type Props = ModalProps & {
  params: RefParams;
  status: StatusFragment[];
};

export default function CommitModal(props: Props) {
  const router = useRouter();
  const defaultMsg = getDefaultCommitMsg(props.params.refName, props.status);
  const [msg, setMsg] = useState(defaultMsg);
  const userHeaders = useUserHeaders();
  const [addCommitAuthor, setAddCommitAuthor] = useState(!!userHeaders);

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const q = `CALL DOLT_COMMIT("-Am", "${msg}"${
      addCommitAuthor
        ? getAuthorInfo(userHeaders?.user, userHeaders?.email)
        : ""
    })`;
    const { href, as } = sqlQuery({ ...props.params, q });
    router.push(href, as).catch(console.error);
  };

  const onClose = () => {
    props.setIsOpen(false);
    setMsg(defaultMsg);
  };

  return (
    <FormModal
      onSubmit={onSubmit}
      title="Create commit"
      isOpen={props.isOpen}
      onRequestClose={onClose}
      disabled={!msg.length}
      btnText="Commit"
    >
      <div>
        <p>
          Stages all tables and commits to{" "}
          <span className={css.bold}>{props.params.refName}</span> with the
          provided message.
        </p>
        <Textarea
          label="Message"
          placeholder="Your commit message here"
          value={msg}
          onChangeString={setMsg}
          rows={4}
          required
          light
        />
        <HeaderUserCheckbox
          shouldAddAuthor={addCommitAuthor}
          setShouldAddAuthor={setAddCommitAuthor}
          userHeaders={userHeaders}
          kind="commit"
        />
      </div>
    </FormModal>
  );
}

function getDefaultCommitMsg(
  refName: string,
  status: StatusFragment[],
): string {
  return `Changes to ${status
    .map(s => s.tableName)
    .join(", ")} from ${refName}`;
}

function getAuthorInfo(name: Maybe<string>, email: Maybe<string>): string {
  if (!name && !email) return "";
  return `, "--author", "${name} <${email}>"`;
}
