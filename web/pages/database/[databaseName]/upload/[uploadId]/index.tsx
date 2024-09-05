import Page from "@components/util/Page";
import { UploadParams } from "@lib/params";
import FileUploadPage from "@pageComponents/FileUploadPage";
import { NextPage } from "next";

type Props = {
  params: UploadParams & {
    branchName?: string | null;
    schemaName?: string | null;
    tableName?: string | null;
  };
};

const DatabaseUploadPage: NextPage<Props> = ({ params }) => (
  <Page title={`Upload file to ${params.databaseName}`} noIndex>
    <FileUploadPage
      params={{
        ...params,
        branchName: params.branchName ?? undefined,
        tableName: params.tableName ?? undefined,
        schemaName: params.schemaName ?? undefined,
      }}
    />
  </Page>
);

export default DatabaseUploadPage;
