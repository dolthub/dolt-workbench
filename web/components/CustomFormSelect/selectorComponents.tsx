import { Option } from "@components/FormSelect";
import Link from "@components/links/Link";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import cx from "classnames";
import {
  MenuProps,
  OptionProps,
  SingleValueProps,
  components,
} from "react-select";
import SelectTabs from "./SelectTabs";
import css from "./index.module.css";
import { FooterProps, FormSelectorProps } from "./types";

function SingleValueComponent(
  props: SingleValueProps<Option, false>,
): JSX.Element {
  return <div className={css.singleValue}>{props.data.label}</div>;
}

function OptionComponent(props: OptionProps<Option, false>): JSX.Element {
  return (
    <components.Option
      {...props}
      className={cx(
        { [css.optionBorder]: props.options[0].label !== props.label },
        { [css.optionClear]: props.options[0].label === props.label },
      )}
    >
      <FiCheck
        className={cx(css.check, { [css.checkInvisible]: !props.isSelected })}
      />
      <div
        className={cx(css.splitByWhiteSpace, css.optionLabel)}
        aria-label={props.data.value}
        data-cy={props.data.value}
      >
        {props.label}
      </div>
    </components.Option>
  );
}

function FooterLink(
  props: FooterProps & { dataCySuffix?: string },
): JSX.Element {
  return (
    <div className={css.linkContainer}>
      <Link
        className={css.link}
        {...props.urlParams}
        data-cy={
          props.dataCySuffix
            ? `link-to-all${props.dataCySuffix || ""}`
            : undefined
        }
      >
        {props.urlString}
      </Link>
    </div>
  );
}

function menuComponent(
  header?: JSX.Element,
  footer?: JSX.Element,
): (props: MenuProps<Option, false>) => JSX.Element {
  const menu = ({ children, ...props }: MenuProps<Option, false>) => (
    <components.Menu {...props}>
      {
        <div>
          {header}
          {children}
          {footer}
        </div>
      }
    </components.Menu>
  );
  return menu;
}

export function getComponents(props: FormSelectorProps) {
  const res = {
    SingleValue: SingleValueComponent,
    Option: OptionComponent,
  };
  return {
    ...res,
    Menu: menuComponent(
      props.tabs && <SelectTabs tabs={props.tabs} />,
      props.footerLink && <FooterLink {...props.footerLink} />,
    ),
  };
}
