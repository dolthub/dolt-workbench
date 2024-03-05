import Link from "@components/links/Link";
import { Button } from "@dolthub/react-components";
import { Route } from "@dolthub/web-utils";
import { BsChevronLeft } from "@react-icons/all-files/bs/BsChevronLeft";
import { ReactNode, useState } from "react";
import { UploadStage } from "../enums";
import WrongStageModal from "./WrongStageModal";
import css from "./index.module.css";

type Props = {
  title: string | ReactNode;
  children: ReactNode;
  stage: UploadStage;
  disabled: boolean;
  onNext?: () => void;
  nextUrl?: Route;
  backUrl?: Route;
  onWrongStage?: boolean;
  dataCy?: string;
};

export default function StepLayout(props: Props) {
  const [modalIsOpen, setModalIsOpen] = useState(!!props.onWrongStage);

  return (
    <div className={css.container}>
      {props.stage !== UploadStage.Branch && props.backUrl && (
        <div className={css.back}>
          <Link {...props.backUrl}>
            <Button.Link data-cy="upload-back-button">
              <BsChevronLeft />
              back
            </Button.Link>
          </Link>
        </div>
      )}
      <h2 data-cy={`${props.dataCy}-title`}>{props.title}</h2>
      <div>{props.children}</div>
      <div className={css.buttons}>
        <NextButton {...props} />
      </div>
      <WrongStageModal isOpen={modalIsOpen} setIsOpen={setModalIsOpen} />
    </div>
  );
}

function NextButton(props: Props) {
  const nextButton = (onClick?: () => void) => (
    <Button
      className={css.next}
      onClick={onClick}
      disabled={props.disabled}
      data-cy="upload-next-button"
    >
      {props.stage === UploadStage.Upload ? "Upload" : "Next"}
    </Button>
  );

  return props.nextUrl ? (
    <Link {...props.nextUrl}>{nextButton()}</Link>
  ) : (
    nextButton(props.onNext)
  );
}
