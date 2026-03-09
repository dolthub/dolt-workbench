import { FormInput, FormModal, Textarea } from "@dolthub/react-components";
import { useEffectAsync } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import { StatusFragment } from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
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

const isElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

export default function CommitModal(props: Props) {
  const router = useRouter();
  const defaultMsg = getDefaultCommitMsg(props.params.refName, props.status);
  const [msg, setMsg] = useState(defaultMsg);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const userHeaders = useUserHeaders();
  const { getCallProcedure } = useSqlBuilder();

  const headerName = userHeaders?.user;
  const headerEmail = userHeaders?.email;
  const hasHeaders = !!headerName || !!headerEmail;

  // Load stored author for Electron, or populate from headers
  useEffectAsync(async () => {
    if (hasHeaders) {
      setAuthorName(headerName ?? "");
      setAuthorEmail(headerEmail ?? "");
      return;
    }
    if (isElectron) {
      const stored = await window.ipc.getCommitAuthor();
      if (stored) {
        setAuthorName(stored.name);
        setAuthorEmail(stored.email);
      }
    }
  }, [userHeaders]);

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    // Persist author on desktop when not using headers
    if (isElectron && !hasHeaders && authorName && authorEmail) {
      await window.ipc.setCommitAuthor({
        name: authorName,
        email: authorEmail,
      });
    }
    const q = getCallProcedure("DOLT_COMMIT", [
      "-Am",
      msg,
      ...getAuthorArgs(authorName, authorEmail),
    ]);
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
        <div className={css.authorFields}>
          <FormInput
            value={authorName}
            label="Author Name"
            onChangeString={setAuthorName}
            placeholder="Author Name"
            disabled={hasHeaders}
            light
          />
          <FormInput
            value={authorEmail}
            label="Author Email"
            onChangeString={setAuthorEmail}
            placeholder="author@example.com"
            disabled={hasHeaders}
            light
          />
          {hasHeaders && (
            <p className={css.authorNote}>
              Author is set from request headers and cannot be edited.
            </p>
          )}
          {!hasHeaders && !isElectron && (
            <p className={css.authorNote}>
              Optional. If not provided, the SQL user will be used as the commit
              author.
            </p>
          )}
          {!hasHeaders && isElectron && (
            <p className={css.authorNote}>
              Optional. Author will be saved for future commits.
            </p>
          )}
        </div>
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

function getAuthorArgs(name: Maybe<string>, email: Maybe<string>): string[] {
  if (!name && !email) return [];
  return ["--author", `${name} <${email}>`];
}
