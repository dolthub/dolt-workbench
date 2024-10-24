import HomePage from "@components/pageComponents/HomePage";
import Page from "@components/util/Page";
import { NextPage } from "next";

const Home: NextPage = () => {
  const description = `Dolt Workbench is a web-based, open-source SQL workbench. It allows you to query, edit, and visualize your data.`;
  return (
    <Page description={description} title="Dolt Workbench">
      <HomePage />
    </Page>
  );
};

export default Home;
