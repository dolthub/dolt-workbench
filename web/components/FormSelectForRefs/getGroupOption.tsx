import Link from "@components/links/Link";
import { FormSelectTypes } from "@dolthub/react-components";
import { Route } from "@dolthub/web-utils";

export default function getGroupOption(
  options: Array<FormSelectTypes.Option<string>>,
  label: string,
  footerRoute: Route,
): FormSelectTypes.CustomGroupBase<FormSelectTypes.Option<string>> {
  const lowerLabel = label.toLowerCase();
  return {
    label,
    options,
    noOptionsMsg: `No ${lowerLabel} found`,
    footer: <Link {...footerRoute}>View all {lowerLabel}</Link>,
  };
}
