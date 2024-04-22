import { Checkbox } from "@dolthub/react-components";
import { UserHeaders } from "@hooks/useUserHeaders";
import { useEffect } from "react";

type Props = {
  shouldAddAuthor: boolean;
  setShouldAddAuthor: (s: boolean) => void;
  userHeaders: UserHeaders | null;
  className?: string;
  kind?: string;
};

export default function HeaderUserCheckbox(props: Props) {
  const disabled = !props.userHeaders;
  const authorKind = props.kind ? `${props.kind} author` : "author";

  useEffect(() => {
    if (!props.userHeaders?.email || !props.userHeaders.user) return;
    props.setShouldAddAuthor(true);
  }, [props.userHeaders]);

  return (
    <Checkbox
      name="add-author"
      label={`Use name and email from headers as ${authorKind}`}
      checked={props.shouldAddAuthor}
      onChange={e => props.setShouldAddAuthor(e.target.checked)}
      description={
        disabled
          ? "Disabled, headers not found. See Docker Hub for more information about user headers."
          : `Recommended. If unchecked, SQL user will be used as ${authorKind}.`
      }
      disabled={disabled}
      className={props.className}
    />
  );
}
