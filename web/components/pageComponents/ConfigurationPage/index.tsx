import MainLayout from "@components/layouts/MainLayout";
import DoltLink from "@components/links/DoltLink";
import AddConnectionOptions from "./AddConnectionOptions";
import css from "./index.module.css";

export default function ConfigurationPage() {
  return (
    <MainLayout className={css.container}>
      <div className={css.inner}>
        <div className={css.top}>
          <h1>Configure your database</h1>
          <p>
            Connect the workbench to any MySQL-compatible database. Use{" "}
            <DoltLink>Dolt</DoltLink> to unlock version control features.
          </p>
        </div>
        <AddConnectionOptions />
      </div>
    </MainLayout>
  );
}
