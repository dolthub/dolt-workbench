import Page from "@components/util/Page";
import { UploadParams } from "@lib/params";
import FileUploadPage from "@pageComponents/FileUploadPage";
import { NextPage } from "next";

type Props = {
  params: UploadParams & {
    branchName?: string | null;
    tableName?: string | null;
    stage?: string | null;
  };
};

const DatabaseUploadStagePage: NextPage<Props> = ({ params }) => (
  <Page
    title={`Upload file to ${params.databaseName} - ${params.stage ?? "Branch"}`}
    noIndex
  >
    <FileUploadPage
      params={{
        ...params,
        branchName: params.branchName ?? undefined,
        tableName: params.tableName ?? undefined,
      }}
      stage={params.stage ?? undefined}
    />
  </Page>
);

export default DatabaseUploadStagePage;
