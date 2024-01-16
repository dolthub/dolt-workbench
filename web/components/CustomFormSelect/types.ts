import { Option } from "@components/FormSelect";
import { Maybe } from "@dolthub/web-utils";
import { Route } from "@lib/urlUtils";

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
  onChangeValue: (e: string) => void;
  val?: Maybe<string>;
  options: Option[];
  label: string;
  dataCySuffix?: string;
  noneFoundMsg?: string;
  footerLink?: FooterProps; // Shows 'View all' link in footer if present
};
