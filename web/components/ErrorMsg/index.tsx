import { gqlConnectionLost } from "@lib/errors/graphql";
import { improveErrorMsg } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  err?: ApolloErrorType;
  errString?: string;
  className?: string;
};

export default function ErrorMsg({ err, errString, className }: Props) {
  const msg = (() => {
    if (err) return improveErrorMsg(err.message);
    if (errString) return improveErrorMsg(errString);
    return null;
  })();

  if (!msg) return null;
  if (msg.includes(gqlConnectionLost)) {
    return <ConnectionLostMessage className={className} errString={msg} />;
  }

  const splitMsg = msg.split("\n").filter(Boolean);
  return (
    <div className={cx(css.errorMsg, className)} aria-label="error-msg">
      {splitMsg.map(m => (
        <div key={m}>{m}</div>
      ))}
    </div>
  );
}

function ConnectionLostMessage(props: {
  className?: string;
  errString: string;
}) {
  return (
    <div>
      <div className={cx(css.errorMsg, props.className)} aria-label="error-msg">
        {props.errString}
      </div>
      <div>This error is often caused by a Dolt issue.</div>
    </div>
  );
}
