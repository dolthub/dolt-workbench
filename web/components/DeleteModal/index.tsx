import { MutationHookOptions, MutationTuple } from "@apollo/client";
import Modal from "@components/Modal";
import { Button, Loader } from "@dolthub/react-components";
import useMutation from "@hooks/useMutation";
import { RefetchQueries } from "@lib/refetchQueries";
import { ReactNode } from "react";

type MutationProps<TData, TVariables> = {
  hook: (
    baseOptions?: MutationHookOptions<TData, TVariables> | undefined,
  ) => MutationTuple<TData, TVariables>;
  variables: TVariables; // Variables to pass to the mutation
  refetchQueries?: RefetchQueries;
};

type Props<TData, TVariables> = {
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
  title: string;
  mutationProps: MutationProps<TData, TVariables>;
  callback?: (d: TData) => void;
  children: ReactNode;
  className?: string;
};

export default function DeleteModal<TData, TVariables>({
  isOpen,
  setIsOpen,
  title,
  mutationProps,
  callback,
  children,
  className,
}: Props<TData, TVariables>): JSX.Element {
  const {
    mutateFn: deleteMutation,
    err,
    setErr,
    loading,
  } = useMutation<TData, TVariables>({
    hook: mutationProps.hook,
    refetchQueries: mutationProps.refetchQueries,
  });

  const onClose = () => {
    setErr(undefined);
    setIsOpen(false);
  };

  const onDelete = async () => {
    const { data } = await deleteMutation({
      variables: mutationProps.variables,
    });
    if (!data) return;
    if (callback) callback(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      title={title}
      className={className}
      button={
        <Button onClick={onDelete} red>
          Delete
        </Button>
      }
      err={err}
    >
      <Loader loaded={!loading} />
      {children}
    </Modal>
  );
}
