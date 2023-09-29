import cx from "classnames";
import Editor, { IAceEditorProps } from "react-ace";

// It is important that these are loaded after the "react-ace" import above.
require("ace-builds/src-noconflict/mode-mysql");
// Uses the Monokai theme as a baseline and overrides
// with custom styles in ace-editor.css
require("ace-builds/src-noconflict/theme-monokai");

type Props = IAceEditorProps & {
  innerRef?: React.MutableRefObject<any>;
  isMobile?: boolean;
};

export default function AceEditor(props: Props) {
  return (
    <Editor
      mode="mysql"
      theme="monokai" // overridden in ace-editor.css
      width="100%"
      highlightActiveLine={false}
      wrapEnabled
      ref={props.innerRef}
      {...props}
      className={cx(props.className, { noMobileEditor: props.isMobile })}
    />
  );
}
