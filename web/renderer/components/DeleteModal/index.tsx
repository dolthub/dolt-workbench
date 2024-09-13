import { Button, Loader, Modal } from "@dolthub/react-components";
import useMutation, { MutationArgs } from "@hooks/useMutation";
import { ReactNode } from "react";
import css from "./index.module.css";

type MutationProps<TData, TVariables> = MutationArgs<TData, TVariables> & {
  variables: TVariables; // Variables to pass to the mutation
};

type Props<TData, TVariables> = {
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
  cannotBeUndone?: boolean;
  asset: string;
  assetId?: string;
  btnText?: string;
  mutationProps: MutationProps<TData, TVariables>;
  callback?: (d: TData) => void;
  children?: ReactNode;
  className?: string;
  buttonDataCy?: string;
};

export default function DeleteModal<TData, TVariables>({
  children,
  className,
  mutationProps,
  ...props
}: Props<TData, TVariables>): JSX.Element {
  const {
    mutateFn: deleteMutation,
    err,
    setErr,
    loading,
  } = useMutation<TData, TVariables>({
    hook: mutationProps.hook,
    refetchQueries: mutationProps.refetchQueries,
    update: mutationProps.update,
  });

  const onClose = () => {
    setErr(undefined);
    props.setIsOpen(false);
  };

  const onDelete = async () => {
    const { success, data } = await deleteMutation({
      variables: mutationProps.variables,
    });
    if (!success || !data) return;
    if (props.callback) props.callback(data);
    onClose();
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={onClose}
      title={`Delete ${props.asset}`}
      className={className}
      err={err}
      button={
        <Button
          onClick={onDelete}
          red
          disabled={loading}
          data-cy={props.buttonDataCy}
        >
          {props.btnText ?? "Delete"}
        </Button>
      }
    >
      <Loader loaded={!loading} />
      {props.assetId && (
        <p>
          Are you sure you want to delete {props.asset}{" "}
          <span className={css.bold}>{props.assetId}</span>?
          {props.cannotBeUndone && " This cannot be undone."}
        </p>
      )}
      {children}
    </Modal>
  );
}
