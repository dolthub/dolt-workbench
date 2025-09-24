import { TestResult } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import Link from "@components/links/Link";
import { tests as testsUrl } from "@lib/urls";
import cx from "classnames";
import css from "@pageComponents/DatabasePage/ForPulls/PullActions/Merge/index.module.css";
import { excerpt } from "@dolthub/web-utils";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import { FiX } from "@react-icons/all-files/fi/FiX";

export function TestResultsListItem({
                               test,
                               params,
                             }: {
  test: TestResult;
  params: RefParams;
}) {
  const isSuccess = test.status === "PASS";
  const isFailure = !isSuccess;

  return (
    <li>
      <Link
        {...testsUrl(params)
          .withQuery({ runTests: "true" })
          .withHash(encodeURIComponent(test.testName))}
        className={cx(
          css.testResultsItemContainer,
          css.testResultsLinkContent,
          {
            [css.testResultsRed]: isFailure,
            [css.testResultsGreen]: isSuccess,
          },
        )}
        data-test-name={test.testName}
      >
        <div className={css.testResultsIcon}>
          <TestResultsListItemIconSwitch test={test} />
        </div>
        <div className={css.testResultsContent}>
          <TestTitle test={test} />
        </div>
      </Link>
    </li>
  );
}

function TestTitle({ test }: { test: TestResult }) {
  return (
    <div className={css.testResultsTestTitle}>
      <span className={css.testResultsTestName}>
        {excerpt(test.testName, 50)}
      </span>
      {test.message && (
        <span className={css.testResultsTestMessage}>
          {excerpt(test.message, 100)}
        </span>
      )}
    </div>
  );
}

function TestResultsListItemIconSwitch({ test }: { test: TestResult }) {
  if (test.status === "PASS") {
    return <FiCheck className={css.testResultsSuccessIcon} />;
  }
  return <FiX className={css.testResultsFailureIcon} />;
}

