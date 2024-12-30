import { OptionalRefParams } from "@lib/params";
import AddItemDropdown from "./AddItemDropdown";
import ResetConnectionButton from "./RefreshConnectionButton";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams & { schemaName?: string };
  onMenuClick: () => void;
};

export default function RightHeaderButtons(props: Props) {
  return (
    <div className={css.topRight}>
      <AddItemDropdown params={props.params} />
      <ResetConnectionButton />
    </div>
  );
}
