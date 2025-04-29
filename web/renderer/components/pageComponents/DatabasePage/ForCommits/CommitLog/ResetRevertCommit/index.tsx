import { Button, ButtonWithPopup } from "@dolthub/react-components";
import { fakeEscapePress } from "@dolthub/web-utils";
import { CommitForHistoryFragment } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { BiReset } from "@react-icons/all-files/bi/BiReset";
import { BiUndo } from "@react-icons/all-files/bi/BiUndo";
import { useState } from "react";
import css from "./index.module.css";
import ResetModal from "./ResetModal";
import RevertModal from "./RevertModal";

type Props = {
  commit: CommitForHistoryFragment;
  params: RefParams;
};

export default function ResetRevertCommit(props: Props) {
  const [revertOpen, setRevertOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  return (
    <>
      <ButtonWithPopup
        buttonClassName={css.button}
        contentStyle={{ width: "14.5rem" }}
      >
        {!!props.commit.parents.length && (
          <Button.Link
            onClick={() => {
              setRevertOpen(true);
              fakeEscapePress();
            }}
            className={css.option}
          >
            <BiUndo />
            Revert this commit
          </Button.Link>
        )}
        <Button.Link
          onClick={() => {
            setResetOpen(true);
            fakeEscapePress();
          }}
          className={css.option}
        >
          <BiReset />
          Reset database to this commit
        </Button.Link>
      </ButtonWithPopup>
      <RevertModal {...props} isOpen={revertOpen} setIsOpen={setRevertOpen} />
      <ResetModal {...props} isOpen={resetOpen} setIsOpen={setResetOpen} />
    </>
  );
}
