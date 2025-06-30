import { Button, ErrorMsg, Loader } from "@dolthub/react-components";
import {
  RemoteFragment,
  useCreateBranchFromRemoteMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { OptionalRefParams } from "@lib/params";
import { refetchRemoteBranchesQueries } from "@lib/refetchQueries";
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import css from "./index.module.css";

type Props = {
  branchName: string;
  remote: RemoteFragment;
  params: OptionalRefParams;
};

export default function CreateBranchButton(props: Props) {
  const {
    mutateFn: createBranch,
    loading,
    err,
  } = useMutation({
    hook: useCreateBranchFromRemoteMutation,
    refetchQueries: refetchRemoteBranchesQueries({
      databaseName: props.params.databaseName,
      toRefName: props.branchName,
      fromRefName: `${props.remote.name}/${props.branchName}`,
    }),
  });

  const onClick = async () => {
    await createBranch({
      variables: {
        databaseName: props.params.databaseName,
        remoteName: props.remote.name,
        branchName: props.branchName,
      },
    });
  };

  return (
    <>
      <Loader loaded={!loading} />
      <Button.Link className={css.button} onClick={onClick}>
        <AiOutlinePlus /> Create local branch
      </Button.Link>
      <ErrorMsg err={err} />
    </>
  );
}
