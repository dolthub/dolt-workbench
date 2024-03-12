import { FormSelectTypes } from "@dolthub/react-components";
import { Maybe, Route } from "@dolthub/web-utils";

export type Tab = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export type BaseFormSelectorProps = {
  selectedValue?: Maybe<string>;
  className?: string;
  mono?: boolean;
  tabs?: Tab[];
  autoFocus?: boolean;
  customDropdown?: boolean;
  showLabel?: boolean;
  placeholder?: string;
  useValueAsSingleValue?: boolean;
  loading?: boolean;
  doltDisabled?: boolean;
};

export type FooterProps = {
  urlParams: Route;
  urlString: string;
};

export type FormSelectorProps = BaseFormSelectorProps & {
  onChangeValue: (e: Maybe<string>) => void;
  val: Maybe<string>;
  options: Array<FormSelectTypes.Option<string>>;
  label: string;
  dataCySuffix?: string;
  noneFoundMsg?: string;
  footerLink?: FooterProps; // Shows 'View all' link in footer if present
};
