import { gqlConnectionLost } from "@lib/errors/graphql";

export default function renderCustomErrorMsg(msg: string) {
  if (msg.includes(gqlConnectionLost)) {
    return <ConnectionLostMessage errString={msg} />;
  }
  return null;
}

function ConnectionLostMessage(props: {
  className?: string;
  errString: string;
}) {
  return (
    <div>
      <div className={props.className} aria-label="error-msg">
        {props.errString}
      </div>
      <div>This error is often caused by a Dolt issue.</div>
    </div>
  );
}
