import { withUserAgent, WithUserAgentProps } from "next-useragent";
import css from "./index.module.css";

const Commands = (props: WithUserAgentProps) => {
  const isMac = props.ua?.isMac;
  const keyOne = isMac ? "command" : "ctrl";
  const keyTwo = isMac ? "return" : "enter";
  return (
    <div className={css.commands}>
      <p>
        <span className={css.bold}>
          {keyOne} + {keyTwo}
        </span>{" "}
        to run
      </p>
      <p>
        <span className={css.bold}>
          {keyOne} + shift + {keyTwo}
        </span>{" "}
        to open/close
      </p>
    </div>
  );
};

export default withUserAgent(Commands);
