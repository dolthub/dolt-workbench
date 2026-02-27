import { MODEL_OPTIONS } from "@contexts/agent/types";
import Dropdown from "../Dropdown";

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
    <Dropdown
      value={selectedModel}
      options={MODEL_OPTIONS}
      onChange={v => onChangeModel(v)}
      disabled={disabled}
    />
  );
}
