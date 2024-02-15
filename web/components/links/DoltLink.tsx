import { ExternalLink } from "@dolthub/react-components";
import { doltGithubRepo } from "@lib/constants";
import { ReactNode } from "react";

type Props = {
  path?: string;
  children?: ReactNode;
  ["data-cy"]?: string;
  className?: string;
};

export default function DoltLink({ path = "", ...props }: Props) {
  return (
    <ExternalLink {...props} href={`${doltGithubRepo}${path}`}>
      {props.children || "Dolt"}
    </ExternalLink>
  );
}
