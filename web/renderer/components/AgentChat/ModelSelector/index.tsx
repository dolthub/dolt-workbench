import { FormSelect } from "@dolthub/react-components";
import { MODEL_OPTIONS, MODELS } from "@contexts/agent/types";
import css from "./index.module.css";

type Props = {
  selectedModel: string;
  onChangeModel: (model: string) => void;
  disabled?: boolean;
};

export default function ModelSelector({
  selectedModel,
  onChangeModel,
  disabled,
}: Props) {
  return (
    <div className={css.container}>
      <FormSelect
        val={selectedModel}
        onChangeValue={v => {
          onChangeModel(v ?? MODELS.SONNET);
        }}
        options={MODEL_OPTIONS}
        light
        small
        isDisabled={disabled}
      />
    </div>
  );
}
