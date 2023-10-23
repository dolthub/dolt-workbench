import useRole from "@hooks/useRole";
import { DatabaseParams } from "@lib/params";

type Props = {
  params: DatabaseParams;
  children: JSX.Element;
  noWritesAction?: string;
  noWritesClassName?: string;
};

export default function HideForNoWritesWrapper(props: Props) {
  const { userHasWritePerms, canWriteToDB } = useRole();

  if (!canWriteToDB) {
    return props.noWritesAction ? (
      <div className={props.noWritesClassName}>
        You must {getAction(props.params, userHasWritePerms)} to{" "}
        {props.noWritesAction}.
      </div>
    ) : null;
  }
  return props.children;
}

function getAction(
  _: DatabaseParams,
  userHasWritePerms: boolean,
  // writesEnabled: boolean,
  // readOnlyConfig: boolean,
) {
  // if (readOnlyConfig) {
  //   return (
  //     <Link {...deployment({ ...params, tab: "configuration" })}>
  //       disable the read-only behavior configuration
  //     </Link>
  //   );
  // }
  // if (!writesEnabled) {
  //   return (
  //     <Link {...deployment({ ...params, tab: "settings" })}>enable writes</Link>
  //   );
  // }
  if (!userHasWritePerms) return "have write permissions";
  return "allow writes";
}
