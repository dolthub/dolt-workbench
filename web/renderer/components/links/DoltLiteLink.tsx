import { ExternalLink } from "@dolthub/react-components";
import { doltliteGithubRepo } from "@lib/constants";
import { ReactNode } from "react";

type Props = {
  path?: string;
  children?: ReactNode;
  ["data-cy"]?: string;
  className?: string;
};

export default function DoltLiteLink({ path = "", ...props }: Props) {
  return (
    <ExternalLink {...props} href={`${doltliteGithubRepo}${path}`}>
      {props.children ?? "DoltLite"}
    </ExternalLink>
  );
}
