import DoltLink from "@components/links/DoltLink";
import DoltgresLink from "@components/links/DoltgresLink";
import DoltLiteLink from "@components/links/DoltLiteLink";
import css from "./index.module.css";

export default function WelcomeMessage() {
  return (
    <div className={css.welcome}>
      <h1 data-cy="welcome-title">Welcome to the Dolt Workbench</h1>
      <p data-cy="welcome-message">
        Connect the workbench to any MySQL, PostgreSQL, or SQLite compatible
        database. Use <DoltLink />, <DoltgresLink />, or <DoltLiteLink /> to
        unlock version control features.
      </p>
    </div>
  );
}
