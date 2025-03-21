import { Btn, ButtonWithPopup } from "@dolthub/react-components";
import { useEffectOnMount } from "@dolthub/react-hooks";
import { fakeEscapePress } from "@dolthub/web-utils";
import useSqlParser from "@hooks/useSqlParser";
import { SqlQueryParams } from "@lib/params";
import { CgArrowsH } from "@react-icons//all-files/cg/CgArrowsH";
import { CgCompress } from "@react-icons//all-files/cg/CgCompress";
import { RiFileDownloadLine } from "@react-icons/all-files/ri/RiFileDownloadLine";
import cx from "classnames";
import { ReactNode, useState } from "react";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import { useDataTableContext } from "@contexts/dataTable";
import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import css from "./index.module.css";
import CsvModal from "./CsvModal";

type Props = {
  onClickHideUnchangedCol?: () => void;
  showingHideUnchangedCol?: boolean;
  children?: JSX.Element | null;
  className?: string;
  params?: SqlQueryParams;
  tableName?: string;
};

export default function DatabaseOptionsDropdown({
  onClickHideUnchangedCol,
  ...props
}: Props): JSX.Element | null {
  const { isMutation } = useSqlParser();
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { onAddEmptyRow, pendingRow } = useDataTableContext();

  useEffectOnMount(() => {
    document.addEventListener("wheel", fakeEscapePress);
    return () => document.removeEventListener("wheel", fakeEscapePress);
  });

  if (!onClickHideUnchangedCol && !props.children && !props.params) return null;
  if (props.params && isMutation(props.params.q)) return null;

  return (
    <div
      className={cx(css.optionsDropdown, props.className)}
      data-cy="db-options-dropdown"
    >
      <ButtonWithPopup
        position="bottom right"
        keepTooltipInside
        contentStyle={{ width: "fit-content" }}
        offsetX={9}
        closeOnEscape
        buttonClassName={css.triggerButton}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        triggerText="Options"
        open={open}
      >
        <div>
          <ul>
            {onClickHideUnchangedCol && (
              <DropdownItem
                data-cy="toggle-trim-button"
                onClick={() => {
                  onClickHideUnchangedCol();
                  fakeEscapePress();
                }}
                icon={
                  props.showingHideUnchangedCol ? <CgArrowsH /> : <CgCompress />
                }
              >
                <>
                  {props.showingHideUnchangedCol ? "Show" : "Hide"} unchanged
                  columns
                </>
              </DropdownItem>
            )}
            {props.params &&
              props.tableName &&
              !isUneditableDoltSystemTable(props.tableName) && (
                <HideForNoWritesWrapper params={props.params}>
                  <DropdownItem
                    data-cy="toggle-trim-button"
                    onClick={() => {
                      onAddEmptyRow();
                      fakeEscapePress();
                    }}
                    icon={<AiOutlinePlus />}
                    disabled={!!pendingRow?.columnValues.length}
                  >
                    Add a row
                  </DropdownItem>
                </HideForNoWritesWrapper>
              )}
            {props.params && (
              <DropdownItem
                data-cy="open-download-csv-modal-button"
                onClick={() => {
                  setModalOpen(true);
                  fakeEscapePress();
                }}
                icon={<RiFileDownloadLine />}
              >
                Download query results as CSV
              </DropdownItem>
            )}
            {props.children}
          </ul>
        </div>
      </ButtonWithPopup>
      {props.params && (
        <CsvModal
          params={props.params}
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
        />
      )}
    </div>
  );
}

type ItemProps = {
  children: JSX.Element | string;
  icon: ReactNode;
  onClick?: () => void;
  ["data-cy"]?: string;
  disabled?: boolean;
};

export function DropdownItem(props: ItemProps) {
  return (
    <li>
      <Btn
        onClick={props.onClick}
        className={cx(css.optionButton, { [css.disabled]: props.disabled })}
        data-cy={props["data-cy"]}
        disabled={props.disabled}
      >
        <span>{props.icon}</span>
        {props.children}
      </Btn>
    </li>
  );
}
