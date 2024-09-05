import Page from "@components/util/Page";
import { DatabaseParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: DatabaseParams;
};

const DiffPageForDefaultBranch: NextPage<Props> = props => (
  <Page title={`Viewing diffs for ${props.params.databaseName}`} noIndex>
    <DatabasePage.ForCommits {...props} params={props.params} />
  </Page>
);

export default DiffPageForDefaultBranch;
