import Link from "@components/links/Link";
import cx from "classnames";
import { useFileUploadContext } from "../contexts/fileUploadLocalForage";
import { FileUploadState } from "../contexts/fileUploadLocalForage/state";
import { getUploadStage, UploadStage } from "../enums";
import css from "./index.module.css";

type Props = {
  activeStage: UploadStage;
};

const stages = ["Branch", "Table", "Upload"];

export default function Navigation(props: Props) {
  return (
    <nav className={css.nav} data-cy="upload-nav">
      <ol>
        {stages.map((stage, i) => (
          <NavItem {...props} key={stage} name={stage} num={i + 1} />
        ))}
      </ol>
    </nav>
  );
}

type ItemProps = {
  name: string;
  activeStage: UploadStage;
  num: number;
};

function NavItem(props: ItemProps) {
  const { state, getUploadUrl } = useFileUploadContext();
  const lowerName = props.name.toLowerCase();
  const stage = getUploadStage(lowerName);
  const active = stage === props.activeStage;
  const complete = getComplete(stage, props.activeStage, state);
  const disabled = getDisabled(complete, stage, state);

  return (
    <li
      className={cx(css.navItem, {
        [css.active]: active,
        [css.complete]: complete,
      })}
      data-cy={`upload-nav-item-${lowerName}${active ? "-active" : ""}${
        complete ? "-complete" : ""
      }`}
    >
      <Link {...getUploadUrl(lowerName)}>
        <button disabled={disabled} type="button">
          {props.num}. {props.name}
        </button>
      </Link>
    </li>
  );
}

// stage is complete if active stage is greater, if the stage is not active
// (except for Confirm), and if corresponding state has been set
function getComplete(
  stage: UploadStage,
  activeStage: UploadStage,
  state: FileUploadState,
): boolean {
  if (activeStage > stage) {
    return true;
  }
  if (activeStage === stage) {
    return false;
  }
  switch (stage) {
    case UploadStage.Branch:
      return !!state.branchName;
    case UploadStage.Table:
      return !!state.tableName;
    case UploadStage.Upload:
      return !!state.selectedFile;
    default:
      return false;
  }
}

// stage is disabled if all steps have been completed (i.e. new branch has been
// created) or if the stage before has set its corresponding state
function getDisabled(
  complete: boolean,
  stage: UploadStage,
  state: FileUploadState,
): boolean {
  if (complete) {
    return false;
  }
  switch (stage) {
    case UploadStage.Branch:
      return false;
    case UploadStage.Table:
      return !state.branchName;
    case UploadStage.Upload:
      return !state.branchName || !state.tableName;
    default:
      return true;
  }
}
