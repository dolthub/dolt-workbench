import Btn from "@components/Btn";
import { useOnClickOutside } from "@dolthub/react-hooks";
import { RiMenu5Line } from "@react-icons/all-files/ri/RiMenu5Line";
import cx from "classnames";
import { ReactNode, useRef } from "react";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
  showDropdown: boolean;
  setShowDropdown: (s: boolean) => void;
  buttonClassName: string;
  forRow?: boolean;
  forTable?: boolean;
  isMobile?: boolean;
  padding?: boolean;
};

export default function CellDropdown({
  setShowDropdown,
  forRow = false,
  forTable = false,
  padding = false,
  ...props
}: Props) {
  const toggle = () => setShowDropdown(!props.showDropdown);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setShowDropdown(false));

  return (
    <div ref={dropdownRef} className={css.cellDropdown}>
      <Btn
        onClick={toggle}
        className={props.buttonClassName}
        data-cy={`${props.isMobile ? "mobile-" : "desktop-"}${
          forRow ? "row" : "cell"
        }-dropdown-button`}
      >
        <RiMenu5Line className={css.icon} />
      </Btn>
      {props.showDropdown && (
        <div
          className={cx(css.dropdown, {
            [css.rowDropdown]: forRow,
            [css.tableDropdown]: forTable,
            [css.padding]: padding,
          })}
        >
          {props.children}
        </div>
      )}
    </div>
  );
}
