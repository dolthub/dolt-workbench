import Link from "@components/links/Link";
import { FormSelectTypes } from "@dolthub/react-components";
import { Route } from "@dolthub/web-utils";
import { ApolloErrorType } from "@lib/errors/types";

export default function getGroupOption(
  options: Array<FormSelectTypes.Option<string>>,
  label: string,
  footerRoute: Route,
  error?: ApolloErrorType,
): FormSelectTypes.CustomGroupBase<FormSelectTypes.Option<string>> {
  const lowerLabel = label.toLowerCase();
  return {
    label,
    options,
    noOptionsMsg: error
      ? `Error getting ${lowerLabel}: ${error.message}`
      : `No ${lowerLabel} found`,
    footer: <Link {...footerRoute}>View all {lowerLabel}</Link>,
  };
}
