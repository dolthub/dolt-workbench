import { Btn } from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import { GiHamburgerMenu } from "@react-icons/all-files/gi/GiHamburgerMenu";
import AddItemDropdown from "./AddItemDropdown";
import RefreshConnectionButton from "./RefreshConnectionButton";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams & { schemaName?: string };
  onMenuClick: () => void;
};

export default function RightHeaderButtons(props: Props) {
  return (
    <div className={css.topRight}>
      <RefreshConnectionButton />
      <AddItemDropdown params={props.params} />
      <div className={css.menu}>
        <Btn onClick={props.onMenuClick}>
          <GiHamburgerMenu />
        </Btn>
      </div>
    </div>
  );
}
