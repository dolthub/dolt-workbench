import dynamic from "next/dynamic";
import css from "./index.module.css";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function QueryEditor({ value, onChange, placeholder }: Props) {
  return (
    <div className={css.container}>
      <AceEditor
        value={value}
        name="TestQueryEditor"
        fontSize={15}
        maxLines={10}
        minLines={4}
        wrapEnabled
        onChange={onChange}
        placeholder={placeholder}
        showGutter={false}
        showPrintMargin={false}
        highlightActiveLine={false}
        theme="github_dark"
        editorProps={{
          $blockScrolling: true,
        }}
      />
    </div>
  );
}
