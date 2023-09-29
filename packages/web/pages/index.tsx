import Page from "@components/util/Page";
import { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  const description = `Dolt SQL Workbench is a web-based SQL editor for DoltDB. It allows you to query, edit, and visualize your DoltDB data.`;
  return (
    <Page description={description} title="Dolt SQL Workbench">
      <main>
        <h1>Welcome to Dolt SQL Workbench</h1>
        <Link href="/database">Launch Workbench</Link>
      </main>
    </Page>
  );
};

export default Home;
