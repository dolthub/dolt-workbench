import ButtonsWithError from "@components/ButtonsWithError";
import TextareaWithMarkdown from "@components/TextareaWithMarkdown";
import { Button, Loader } from "@dolthub/react-components";
import useEditDoc from "@hooks/useEditDoc";
import { DocParams } from "@lib/params";
import toDocType from "@lib/toDocType";

type Props = {
  markdown: string;
  params: DocParams;
  setShowEditor: (s: boolean) => void;
};

export default function Editor(props: Props) {
  const { onSubmit, state, setState } = useEditDoc(
    props.params,
    toDocType(props.params.docName),
    props.markdown,
  );

  const setMarkdown = (m: string) => setState({ markdown: m });

  const onCancel = () => {
    setMarkdown(props.markdown);
    props.setShowEditor(false);
  };

  return (
    <form onSubmit={onSubmit} aria-label="markdown-editor">
      <Loader loaded={!state.loading} />
      <TextareaWithMarkdown
        rows={15}
        value={state.markdown}
        onChange={setMarkdown}
      />
      <ButtonsWithError onCancel={onCancel}>
        <Button type="submit" data-cy="submit-edit-docs-button">
          Save
        </Button>
      </ButtonsWithError>
    </form>
  );
}
