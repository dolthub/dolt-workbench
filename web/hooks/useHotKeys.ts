import { useSqlEditorContext } from "@contexts/sqleditor";
import { useEffect, useState } from "react";
import { KeyMap } from "react-hotkeys";

type ReturnType = {
  keyMap: KeyMap | undefined;
  handlers: {
    [key: string]: (keyEvent?: KeyboardEvent | undefined) => void;
  };
};

export default function useHotKeys(): ReturnType {
  const { toggleSqlEditor } = useSqlEditorContext();
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (toggling) {
      toggleSqlEditor();
      setToggling(false);
    }
  }, [toggling, setToggling, toggleSqlEditor]);

  return {
    keyMap: { TOGGLE_EDITOR: ["meta+shift+enter", "ctrl+shift+enter"] },
    handlers: { TOGGLE_EDITOR: () => setToggling(true) },
  };
}
