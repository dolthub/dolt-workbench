import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import css from "./index.module.css";

type Props = {
  hasConflicts: boolean;
};

export default function MergeMessageTitle(props: Props) {
  if (props.hasConflicts) {
    return (
      <div className={css.red}>
        <IoMdClose className={css.mergeStatusIcon} />
        <div>
          <span>Has conflicts.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={css.green}>
      <FiCheck className={css.mergeStatusIcon} />
      Ready to merge.
    </div>
  );
}
