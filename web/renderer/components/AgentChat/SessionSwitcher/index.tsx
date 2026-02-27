import { SessionInfo } from "@contexts/agent";
import { excerpt } from "@dolthub/web-utils";
import TimeAgo from "react-timeago";
import Dropdown from "../Dropdown";

const NEW_CHAT_VALUE = "__new_chat__";

type Props = {
  currentSessionId: string | null;
  sessions: SessionInfo[];
  onNewChat: () => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  disabled?: boolean;
};

export default function SessionSwitcher({
  currentSessionId,
  sessions,
  onNewChat,
  onSwitchSession,
  onDeleteSession,
  disabled,
}: Props) {
  const options = [
    { label: "+ New chat", value: NEW_CHAT_VALUE, deletable: false },
    ...sessions.map(s => {
      return {
        label: excerpt(s.firstMessage, 40),
        value: s.sessionId,
        deletable: true,
        detail: <TimeAgo date={s.lastUpdated} />,
      };
    }),
  ];

  return (
    <Dropdown
      value={currentSessionId ?? NEW_CHAT_VALUE}
      options={options}
      onChange={v => {
        if (v === NEW_CHAT_VALUE) {
          onNewChat();
        } else {
          onSwitchSession(v);
        }
      }}
      onDelete={v => {
        if (v !== NEW_CHAT_VALUE) {
          onDeleteSession(v);
        }
      }}
      disabled={disabled}
    />
  );
}
