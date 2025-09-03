import dynamic from "next/dynamic";

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
    <div className="bg-storm-600 rounded-sm border border-storm-500 overflow-hidden p-2">
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