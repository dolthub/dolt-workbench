import ErrorMsg from "@components/ErrorMsg";
import Link from "@components/links/Link";
import { ApolloErrorType } from "@lib/errors/types";
import { ReactElement, ReactNode } from "react";
import Code404 from "./Code404";
import css from "./index.module.css";

type Props = {
  title?: string;
  children?: ReactNode;
  error?: ApolloErrorType;
};

export const defaultTitle = "Page not found";
export const errorText = "Sorry, but there was an error loading this page.";
export const notFoundText =
  "Sorry, but the page you were looking for could not be found.";

export default function Page404({
  title = defaultTitle,
  children,
  error,
}: Props): ReactElement {
  const sorryText = error ? errorText : notFoundText;
  return (
    <div className={css.page} data-cy="404-page">
      <h1>{title}</h1>
      {!error && <Code404 />}
      {children ? (
        <div>{children}</div>
      ) : (
        <div className={css.text}>
          <p>{sorryText}</p>
          <p data-cy="404-page-links">
            Return to our <Link href="/">homepage</Link>, or{" "}
            <Link href="/contact">reach out to us</Link> if you can&apos;t find
            what you&apos;re looking for.
          </p>
        </div>
      )}
      {error && (
        <div className={css.error}>
          <span>Additional error details: </span>
          <ErrorMsg err={error} />
        </div>
      )}
    </div>
  );
}
