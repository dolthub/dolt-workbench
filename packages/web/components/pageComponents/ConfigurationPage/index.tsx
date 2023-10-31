import Navbar from "@components/Navbar";
import DoltLink from "@components/links/DoltLink";
import AddConnectionOptions from "./AddConnectionOptions";
import css from "./index.module.css";

export default function ConfigurationPage() {
  return (
    <div>
      <Navbar home />
      <main className={css.container}>
        <div className={css.top}>
          <h1>Configure Database</h1>
          <p>
            Connect to the workbench using any MySQL-compatible database. Use{" "}
            <DoltLink>Dolt</DoltLink> to unlock version control features, like
            branch, commits, and merge.
          </p>
        </div>
        <AddConnectionOptions />
      </main>
    </div>
  );
}
