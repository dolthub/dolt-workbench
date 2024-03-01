import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import Modal from "@components/Modal";
import { Textarea } from "@dolthub/react-components";
import { StatusFragment } from "@gen/graphql-types";
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
  // const [addCommitAuthor, setAddCommitAuthor] = useState(true);

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const q = `CALL DOLT_COMMIT("-Am", "${msg}")`;
    const { href, as } = sqlQuery({ ...props.params, q });
    router.push(href, as).catch(console.error);
  };

  const onClose = () => {
    props.setIsOpen(false);
    setMsg(defaultMsg);
  };

  return (
    <Modal title="Create Commit" isOpen={props.isOpen} onRequestClose={onClose}>
      <div>
        <p>
          Stages all tables and commits to{" "}
          <span className={css.bold}>{props.params.refName}</span> with the
          provided message.
        </p>
        <form onSubmit={onSubmit}>
          <Textarea
            label="Message"
            placeholder="Your commit message here"
            value={msg}
            onChangeString={setMsg}
            rows={4}
            required
          />
          {/* <div>
            <Checkbox
              name="add-commit-author"
              label="Use my name and email as commit author"
              checked={addCommitAuthor}
              onChange={e => setAddCommitAuthor(e.target.checked)}
              description="Recommended. If unchecked, Dolt System Account will be used as
              commit author."
              blue
            />
          </div> */}
          <ButtonsWithError onCancel={onClose}>
            <Button type="submit" disabled={!msg.length}>
              Commit
            </Button>
          </ButtonsWithError>
        </form>
      </div>
    </Modal>
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

// function getAuthorInfo(currentUser?: CurrentUserFragment): string {
//   if (!currentUser) return "";
//   return `, "--author", "${currentUser.username} <${currentUser.emailAddressesList[0].address}>"`;
// }
