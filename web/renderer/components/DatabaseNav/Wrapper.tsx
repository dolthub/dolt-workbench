import { SmallLoader } from "@dolthub/react-components";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { OptionalRefParams, RefParams } from "@lib/params";
import useGetRefParams from "./useGetRefParams";

type Props = {
  params: OptionalRefParams;
  renderChild: (params: OptionalRefParams) => JSX.Element;
};

type QueryProps = Props & {
  params: RefParams;
};

export default function Wrapper(props: Props) {
  const { isDolt } = useDatabaseDetails(props.params.connectionName);
  if (props.params.refName && isDolt) {
    return (
      <Query
        {...props}
        params={{ ...props.params, refName: props.params.refName }}
      />
    );
  }

  return props.renderChild(props.params);
}

function Query(props: QueryProps) {
  const { loading, refName } = useGetRefParams(props.params);

  if (loading) {
    return <SmallLoader loaded={!loading} />;
  }

  return props.renderChild({ ...props.params, refName });
}
