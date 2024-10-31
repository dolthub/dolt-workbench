import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button } from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import { useState } from "react";
import CreateViewModal from "./CreateViewModal";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams;
  query: string;
};

export default function CreateViewButton(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HideForNoWritesWrapper params={props.params}>
      <div>
        <Button
          onClick={() => setIsOpen(true)}
          className={css.button}
          size="small"
        >
          Create View
        </Button>
        <CreateViewModal {...props} isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    </HideForNoWritesWrapper>
  );
}
