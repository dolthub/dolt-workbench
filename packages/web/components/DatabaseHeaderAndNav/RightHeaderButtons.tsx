import Btn from "@components/Btn";
import { DatabaseParams } from "@lib/params";
import { GiHamburgerMenu } from "@react-icons/all-files/gi/GiHamburgerMenu";
import AddItemDropdown from "./AddItemDropdown";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams & { refName?: string };
  onMenuClick: () => void;
};

export default function RightHeaderButtons(props: Props) {
  return (
    <div className={css.topRight}>
      <AddItemDropdown params={props.params} />
      <div className={css.menu}>
        <Btn onClick={props.onMenuClick}>
          <GiHamburgerMenu />
        </Btn>
      </div>
    </div>
  );
}
