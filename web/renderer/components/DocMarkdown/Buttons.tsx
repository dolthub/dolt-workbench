import Link from "@components/links/Link";
import { Button, Loader } from "@dolthub/react-components";
import useEditDoc from "@hooks/useEditDoc";
import { DocParams, RefParams } from "@lib/params";
import toDocType from "@lib/toDocType";
import { defaultDoc, newDoc } from "@lib/urls";
import { useRouter } from "next/router";
import { SyntheticEvent } from "react";
import css from "./index.module.css";
import { isDefaultDocOrDocNamesMatch } from "./utils";

type Props = {
  params: RefParams & { docName?: string };
  doltDocsQueryDocName?: string;
  showEditor: boolean;
  setShowEditor: (s: boolean) => void;
};

type InnerProps = {
  params: DocParams;
  showEditor: boolean;
  setShowEditor: (s: boolean) => void;
};

function Inner(props: InnerProps) {
  const router = useRouter();
  const { onSubmit, state } = useEditDoc(
    props.params,
    toDocType(props.params.docName),
  );

  const handleDelete = async (e: SyntheticEvent) => {
    const result = await onSubmit(e);
    if (result.success) {
      const { href, as } = defaultDoc(props.params);
      router.push(href, as).catch(console.error);
    }
  };

  return (
    <div>
      <Loader loaded={!state.loading} />
      <Button.Group className={css.buttons}>
        <Button
          onClick={() => props.setShowEditor(!props.showEditor)}
          className={css.edit}
        >
          edit
        </Button>
        <Button.Link underlined onClick={handleDelete} red>
          delete
        </Button.Link>
      </Button.Group>
    </div>
  );
}

export default function Buttons(props: Props) {
  if (!props.params.docName) return null;

  if (
    !isDefaultDocOrDocNamesMatch(
      props.params.docName,
      props.doltDocsQueryDocName,
    )
  ) {
    return (
      <div className={css.buttons}>
        <Link {...newDoc(props.params)}>
          <Button>Add {props.params.docName}</Button>
        </Link>
      </div>
    );
  }

  return (
    <Inner
      {...props}
      params={{ ...props.params, docName: props.params.docName }}
    />
  );
}
