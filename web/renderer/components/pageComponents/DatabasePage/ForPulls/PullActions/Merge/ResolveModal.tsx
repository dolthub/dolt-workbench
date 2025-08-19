import Link from "@components/links/Link";
import { Button, ExternalLink, Modal, Radio } from "@dolthub/react-components";
import { ConflictResolveType } from "@gen/graphql-types";
import { ModalProps } from "@lib/modalProps";
import { PullDiffParams } from "@lib/params";
import { pullConflicts } from "@lib/urls";
import { useState } from "react";
import css from "./index.module.css";

type Props = ModalProps & {
  onClickWithResolve: (resolveType: ConflictResolveType) => Promise<void>;
  params: PullDiffParams;
};

export default function ResolveModal(props: Props) {
  const [resType, setResType] = useState<ConflictResolveType>(
    ConflictResolveType.Ours,
  );

  return (
    <Modal
      title="Resolve Conflicts and Merge"
      isOpen={props.isOpen}
      onRequestClose={() => props.setIsOpen(false)}
      className={css.modal}
      button={
        <Button onClick={async () => await props.onClickWithResolve(resType)}>
          Choose {resType.toLowerCase()} and merge
        </Button>
      }
    >
      <div>
        <p>
          To merge this pull request, choose a conflict resolution strategy:
        </p>
        <Radio
          label="Use ours"
          name="ours"
          checked={resType === ConflictResolveType.Ours}
          onChange={() => setResType(ConflictResolveType.Ours)}
        />
        <Radio
          label="Use theirs"
          name="theirs"
          checked={resType === ConflictResolveType.Theirs}
          onChange={() => setResType(ConflictResolveType.Theirs)}
        />
        <p>
          You can view the table conflicts before merging{" "}
          <Link {...pullConflicts(props.params)}>here</Link>.
        </p>
        <p>
          If you&apos;d like more granular conflict resolution, see{" "}
          <ExternalLink href="https://www.dolthub.com/blog/2021-03-15-programmatic-merge-and-resolve/">
            this guide
          </ExternalLink>
          .
        </p>
      </div>
    </Modal>
  );
}
