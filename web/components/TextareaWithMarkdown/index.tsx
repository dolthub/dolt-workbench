import { Tab, TabList, TabPanel, Tabs } from "@components/Tabs";
import { Markdown, Textarea } from "@dolthub/react-components";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  value: string;
  label?: string;
  rows: number;
  placeholder?: string;
  onChange: (c: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  hasError?: boolean;
  maxLength?: number;
  light?: boolean;
  inputref?: React.RefObject<HTMLTextAreaElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => Promise<void>;
  forModal?: boolean;
  ["aria-label"]?: string;
  className?: string;
  mobileComment?: boolean;
  tallForm?: boolean;
  unRoundBottom?: boolean;
  name?: string;
};

export default function TextareaWithMarkdown({
  onChange,
  forModal = false,
  unRoundBottom = false,
  mobileComment = false,
  ...props
}: Props) {
  return (
    <div>
      {props.label && <div className={css.label}>{props.label}</div>}
      <div
        className={cx(css.outerContainer, props.className, {
          [css.mobileComment]: mobileComment,
          [css.unRoundBottom]: unRoundBottom,
        })}
      >
        <Tabs>
          <TabList className={css.tabList}>
            <Tab index={0} data-cy="markdown-write">
              Write
            </Tab>
            <Tab index={1} data-cy="markdown-preview">
              Preview
            </Tab>
          </TabList>

          <TabPanel index={0}>
            <div className={css.container}>
              <Textarea
                {...props}
                onChange={undefined}
                onChangeString={onChange}
                className={cx(css.textareaComponent, {
                  [css.forModal]: forModal,
                  [css.mobileCommentTextarea]: mobileComment,
                  [css.tallFormTextarea]: props.tallForm,
                })}
                label={undefined}
                dir="auto"
              />
            </div>
          </TabPanel>
          <TabPanel index={1}>
            <Markdown
              value={props.value}
              className={cx(css.container, css.markdown, {
                [css.mobileCommentTextarea]: mobileComment,
              })}
              forModal={forModal}
            />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
