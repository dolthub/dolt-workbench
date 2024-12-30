import { Btn } from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import { GiHamburgerMenu } from "@react-icons/all-files/gi/GiHamburgerMenu";
import AddItemDropdown from "./AddItemDropdown";
import ResetConnectionButton from "./RefreshConnectionButton";
import css from "./index.module.css";

const forMacNav = process.env.NEXT_PUBLIC_FOR_MAC_NAV === "true";

type Props = {
  params: OptionalRefParams & { schemaName?: string };
  onMenuClick: () => void;
};

export default function RightHeaderButtons(props: Props) {
  return (
    <div className={css.topRight}>
      <AddItemDropdown params={props.params} />
      <ResetConnectionButton />
      {!forMacNav && (
        <div className={css.menu}>
          <Btn onClick={props.onMenuClick}>
            <GiHamburgerMenu />
          </Btn>
        </div>
      )}
    </div>
  );
}
