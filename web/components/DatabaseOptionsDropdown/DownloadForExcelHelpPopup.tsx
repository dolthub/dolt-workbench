import { Tooltip } from "@dolthub/react-components";
import { BsFillQuestionCircleFill } from "@react-icons/all-files/bs/BsFillQuestionCircleFill";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  className?: string;
  id: string;
};

export default function DownloadForExcelHelpPopup({ className, id }: Props) {
  const tipText = "Download CSV with BOM to open in Excel";

  return (
    <>
      <span
        data-tooltip-id={id}
        data-tooltip-content={tipText}
        data-tooltip-place="bottom"
      >
        <BsFillQuestionCircleFill className={cx(css.icon, className)} />
      </span>
      <Tooltip id={id} />
    </>
  );
}
