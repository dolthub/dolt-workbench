import DatabasePage from "@components/pageComponents/DatabasePage";
import Page from "@components/util/Page";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: {
    active?: string;
  };
};

const DefaultBranch: NextPage<Props> = ({ params }) => (
  <Page title={`Database`}>
    <DatabasePage.ForDefaultBranch params={{ ...params, refName: "main" }} />
  </Page>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
}) => {
  return {
    props: {
      params: {
        active: query.active ? String(query.active) : "",
      },
    },
  };
};

export default DefaultBranch;
