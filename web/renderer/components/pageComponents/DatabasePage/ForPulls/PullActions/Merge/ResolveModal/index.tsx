import Link from "@components/links/Link";
import {
  Button,
  ErrorMsg,
  ExternalLink,
  Modal,
  Radio,
} from "@dolthub/react-components";
import { ApolloErrorType } from "@lib/errors/types";
import { ModalProps } from "@lib/modalProps";
import { PullDiffParams } from "@lib/params";
import { pullConflicts } from "@lib/urls";
import { ConflictResolveType, MergeButtonState } from "../useMergeButton";
import css from "./index.module.css";

type Props = ModalProps & {
  onClickWithResolve: () => Promise<void>;
  params: PullDiffParams;
  err?: ApolloErrorType;
  state: MergeButtonState;
  setState: (s: Partial<MergeButtonState>) => void;
};

export default function ResolveModal(props: Props) {
  function setResolutionAllTables(resType: ConflictResolveType) {
    const tablesToResolve = new Map(
      [...props.state.tablesToResolve.keys()].map(t => [t, resType]),
    );
    props.setState({ tablesToResolve });
  }

  function setResolutionOneTable(table: string, resType: ConflictResolveType) {
    const tablesToResolve = props.state.tablesToResolve;
    tablesToResolve.set(table, resType);
    props.setState({ tablesToResolve });
  }

  return (
    <Modal
      title="Resolve Conflicts and Merge"
      isOpen={props.isOpen}
      onRequestClose={() => props.setIsOpen(false)}
      className={css.modal}
      button={
        <Button
          onClick={async () => props.onClickWithResolve()}
          disabled={!!props.err}
        >
          Resolve tables and merge
        </Button>
      }
    >
      <div>
        <p>
          To merge this pull request, choose a conflict resolution strategy for
          all tables or each individual table:
        </p>
        <div className={css.selectAllButtons}>
          <Button.Link
            onClick={() => {
              setResolutionAllTables(ConflictResolveType.Ours);
            }}
            underlined
          >
            Select <span className={css.bold}>ours</span> for all
          </Button.Link>
          <Button.Link
            onClick={() => {
              setResolutionAllTables(ConflictResolveType.Theirs);
            }}
            underlined
          >
            Select <span className={css.bold}>theirs</span> for all
          </Button.Link>
        </div>
        <ul>
          {[...props.state.tablesToResolve.entries()].map(
            ([table, resType]) => (
              <li key={table} className={css.tableResolve}>
                <span className={css.tableName}>{table}</span>
                <span className={css.radios}>
                  <Radio
                    label="Ours"
                    name={`ours-${table}`}
                    checked={resType === ConflictResolveType.Ours}
                    onChange={() => {
                      setResolutionOneTable(table, ConflictResolveType.Ours);
                    }}
                    className={css.radio}
                  />
                  <Radio
                    label="Theirs"
                    name={`theirs-${table}`}
                    checked={resType === ConflictResolveType.Theirs}
                    onChange={() => {
                      setResolutionOneTable(table, ConflictResolveType.Theirs);
                    }}
                    className={css.radio}
                  />
                </span>
              </li>
            ),
          )}
        </ul>
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
        <ErrorMsg err={props.err} />
      </div>
    </Modal>
  );
}
