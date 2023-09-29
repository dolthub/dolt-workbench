import { useSqlEditorContext } from "@contexts/sqleditor";
import ErrorModal from "./ErrorModal";

export default function Errors() {
  const { modalState, setModalState } = useSqlEditorContext();
  return (
    <div>
      <ErrorModal
        isOpen={modalState.errorIsOpen}
        setIsOpen={(o: boolean) => setModalState({ errorIsOpen: o })}
      />
    </div>
  );
}
