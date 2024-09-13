import Link from "@components/links/Link";
import { Button, Loader } from "@dolthub/react-components";
import useEditDoc from "@hooks/useEditDoc";
import { DocParams, RefParams } from "@lib/params";
import toDocType from "@lib/toDocType";
import { newDoc } from "@lib/urls";
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
  const { onSubmit, state } = useEditDoc(
    props.params,
    toDocType(props.params.docName),
  );

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
        <Button.Link underlined onClick={onSubmit} red>
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
