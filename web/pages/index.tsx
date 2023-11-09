import HomePage from "@components/pageComponents/HomePage";
import Page from "@components/util/Page";
import { NextPage } from "next";

const Home: NextPage = () => {
  const description = `Dolt MySQL Workbench is a web-based SQL editor for DoltDB. It allows you to query, edit, and visualize your DoltDB data.`;
  return (
    <Page description={description} title="Dolt Workbench">
      <HomePage />
    </Page>
  );
};

export default Home;
