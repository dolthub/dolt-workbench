import Page from "@components/util/Page";
import { DatabaseParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: DatabaseParams;
};

const DiffPageForDefaultBranch: NextPage<Props> = props => (
  <Page title={`Viewing diffs for ${props.params.databaseName}`} noIndex>
    <DatabasePage.ForCommits {...props} params={props.params} />
  </Page>
);

// #!if !isElectron
export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
}) => {
  return {
    props: {
      params: params as DatabaseParams,
    },
  };
};
// #!endif

export default DiffPageForDefaultBranch;
