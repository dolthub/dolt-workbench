import Editor, { IAceEditorProps } from "react-ace";

// It is important that these are loaded after the "react-ace" import above.
require("ace-builds/src-noconflict/mode-mysql");
// Uses the github_dark theme as a baseline and overrides
// with custom styles in ace-editor.css
require("ace-builds/src-noconflict/theme-github_dark");
require("ace-builds/src-noconflict/theme-github");

type Props = IAceEditorProps & {
  innerRef?: React.MutableRefObject<any>;
  light?: boolean;
};

export default function AceEditor(props: Props) {
  return (
    <Editor
      mode="mysql"
      theme={props.light ? "github" : "github_dark"} // overridden in ace-editor.css
      width="100%"
      highlightActiveLine={false}
      wrapEnabled
      ref={props.innerRef}
      {...props}
      className={props.className}
    />
  );
}
