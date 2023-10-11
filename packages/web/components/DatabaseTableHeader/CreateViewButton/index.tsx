import Button from "@components/Button";
import { DatabaseParams } from "@lib/params";
import { useState } from "react";
import CreateViewModal from "./CreateViewModal";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams & { refName?: string };
  query: string;
};

export default function CreateViewButton(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} className={css.button}>
        Create View
      </Button>
      <CreateViewModal {...props} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}
