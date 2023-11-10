import HelpPopup from "@components/HelpPopup";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
  title: string;
  helpText?: string;
};

export default function TableOption(props: Props) {
  // get lowercased first word of title ("create" or "update")
  const typeForDataCy = props.title.split(" ")[0].toLowerCase();
  return (
    <div>
      <div className={css.title} data-cy={`upload-table-${typeForDataCy}`}>
        <div className={css.bold}>{props.title}</div>
        {props.helpText && (
          <HelpPopup className={css.questionIcon}>
            <div>{props.helpText}</div>
          </HelpPopup>
        )}
      </div>
      <div className={css.inner}>{props.children}</div>
    </div>
  );
}
