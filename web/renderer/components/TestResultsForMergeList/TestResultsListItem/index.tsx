import { TestResult } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import cx from "classnames";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import { FiX } from "@react-icons/all-files/fi/FiX";
import { excerpt } from "@dolthub/web-utils";
import css from "./index.module.css";
import Link from "@components/links/Link";
import { tests as testsUrl } from "@lib/urls";

export type TestStatusColors = {
  red: boolean;
  orange: boolean;
  green: boolean;
};

type Props = {
  test: TestResult;
  params: RefParams;
};

function TestTitle({ test }: { test: TestResult }) {
  return (
    <div className={css.testTitle}>
      <span className={css.testName}>{excerpt(test.testName, 50)}</span>
      {test.message && (
        <span className={css.testMessage}>{excerpt(test.message, 100)}</span>
      )}
    </div>
  );
}

function IconSwitch({ test }: { test: TestResult }) {
  if (test.status === "PASS") {
    return <FiCheck className={css.successIcon} />;
  }
  return <FiX className={css.failureIcon} />;
}

export default function TestResultsListItem({ test, params }: Props) {
  const isSuccess = test.status === "PASS";
  const isFailure = !isSuccess;

  return (
    <li>
      <Link
        {...testsUrl(params)
          .withQuery({ runTests: "true" })
          .withHash(encodeURIComponent(test.testName))}
        className={cx(css.itemContainer, css.linkContent, {
          [css.red]: isFailure,
          [css.green]: isSuccess,
        })}
        data-test-name={test.testName}
      >
        <div className={css.icon}>
          <IconSwitch test={test} />
        </div>
        <div className={css.content}>
          <TestTitle test={test} />
        </div>
      </Link>
    </li>
  );
}
