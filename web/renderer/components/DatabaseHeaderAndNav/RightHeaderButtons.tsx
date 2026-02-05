import { OptionalRefParams } from "@lib/params";
import AddItemDropdown from "./AddItemDropdown";
import AgentButton from "./AgentButton";
import RefreshConnectionButton from "./RefreshConnectionButton";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams & { schemaName?: string };
};

export default function RightHeaderButtons(props: Props) {
  return (
    <div className={css.topRight}>
      <RefreshConnectionButton />
      <AddItemDropdown params={props.params} />
      <AgentButton />
    </div>
  );
}
