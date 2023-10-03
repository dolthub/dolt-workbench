import DatabasePage from "@components/pageComponents/DatabasePage";
import Page from "@components/util/Page";
import { DatabaseParams } from "@lib/params";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: DatabaseParams & {
    active?: string;
  };
};

const DefaultBranch: NextPage<Props> = ({ params }) => (
  <Page title="Database">
    <DatabasePage.ForDefaultBranch params={{ ...params, refName: "main" }} />
  </Page>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...(params as DatabaseParams),
        active: query.active ? String(query.active) : "",
      },
    },
  };
};

export default DefaultBranch;
