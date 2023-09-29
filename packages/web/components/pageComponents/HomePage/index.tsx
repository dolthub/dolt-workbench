import DoltLink from "@components/links/DoltLink";
import AddConnectionForm from "./AddConnectionForm";
import css from "./index.module.css";

export default function HomePage() {
  return (
    <main className={css.container}>
      <h1>Welcome to the Dolt SQL Workbench</h1>
      <p>
        Connect to the workbench using any MySQL-compatible database. Use{" "}
        <DoltLink>Dolt</DoltLink> to unlock version control features, like
        branch, commits, and merge.
      </p>
      <AddConnectionForm />
    </main>
  );
}
