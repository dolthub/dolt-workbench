import { useCallback, useEffect, useRef, useState } from "react";
import cx from "classnames";
import css from "./index.module.css";

export type DropdownOption = {
  label: string;
  value: string;
  deletable?: boolean;
  detail?: React.ReactNode;
};

type Props = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  onDelete?: (value: string) => void;
  disabled?: boolean;
};

export default function Dropdown({
  value,
  options,
  onChange,
  onDelete,
  disabled,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const positionMenu = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menu = menuRef.current;
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left}px`;
    // Clamp width so it doesn't overflow the window
    menu.style.maxWidth = `${window.innerWidth - rect.left - 8}px`;
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      positionMenu();
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, positionMenu]);

  const selected = options.find(o => o.value === value);

  return (
    <div className={css.wrapper} ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        className={css.trigger}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={css.triggerLabel}>
          {selected?.label ?? "Select..."}
        </span>
        <span className={css.triggerArrow}>▾</span>
      </button>
      {isOpen && (
        <div ref={menuRef} className={css.menu}>
          {options.map(option => (
            <div
              key={option.value}
              className={cx(css.option, {
                [css.optionActive]: option.value === value,
              })}
            >
              <span
                role="button"
                tabIndex={0}
                className={css.optionLabel}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
              >
                <span className={css.optionLabelText}>{option.label}</span>
                {option.detail && (
                  <span className={css.optionDetail}>{option.detail}</span>
                )}
              </span>
              {onDelete && option.deletable !== false && (
                <button
                  type="button"
                  className={css.deleteButton}
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(option.value);
                  }}
                  aria-label="Delete"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
