import DoltLink from "@components/links/DoltLink";
import DoltgresLink from "@components/links/DoltgresLink";
import css from "./index.module.css";

export default function WelcomeMessage() {
  return (
    <div className={css.welcome}>
      <h1>Welcome to the Dolt Workbench</h1>
      <p>
        Connect the workbench to any MySQL or PostgreSQL compatible database.
        Use <DoltLink /> or <DoltgresLink /> to unlock version control features.
      </p>
    </div>
  );
}
