import { Popup, PopupProps } from "@dolthub/react-components";
import { BsFillQuestionCircleFill } from "@react-icons/all-files/bs/BsFillQuestionCircleFill";
import cx from "classnames";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  popupProps?: Partial<PopupProps>;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  blue?: boolean;
};

export default function HelpPopup(props: Props) {
  return (
    <div
      className={cx(props.className, {
        [css.blue]: !!props.blue,
        [css.question]: !props.icon,
      })}
    >
      <Popup
        position={props.icon ? "top center" : "right center"}
        on="hover"
        trigger={<div>{props.icon ?? <BsFillQuestionCircleFill />}</div>}
        contentStyle={props.icon ? { width: "30rem" } : {}}
        {...props.popupProps}
      >
        <div className={css.popup}>{props.children}</div>
      </Popup>
    </div>
  );
}
