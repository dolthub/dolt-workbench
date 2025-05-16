import { UploadParamsWithOptions } from "@lib/params";
import { uploadStage } from "@lib/urls";
import { ReactNode } from "react";
import Link, { LinkProps } from "./Link";

type Props = LinkProps & {
  children: ReactNode;
  stage: string;
  dataCyPrefix?: string;
  params: UploadParamsWithOptions & {
    spreadsheet?: boolean;
  };
};

export default function DatabaseUploadStageLink({ children, ...props }: Props) {
  return (
    <Link {...props} {...uploadStage({ ...props.params, stage: props.stage })}>
      {children}
    </Link>
  );
}
