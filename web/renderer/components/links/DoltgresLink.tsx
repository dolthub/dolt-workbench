import { ExternalLink } from "@dolthub/react-components";
import { doltgresGithubRepo } from "@lib/constants";
import { ReactNode } from "react";

type Props = {
  path?: string;
  children?: ReactNode;
  ["data-cy"]?: string;
  className?: string;
};

export default function DoltgresLink({ path = "", ...props }: Props) {
  return (
    <ExternalLink {...props} href={`${doltgresGithubRepo}${path}`}>
      {props.children || "Doltgres"}
    </ExternalLink>
  );
}
