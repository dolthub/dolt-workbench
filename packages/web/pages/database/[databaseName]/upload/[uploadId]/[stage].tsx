import Page from "@components/util/Page";
import { UploadParams } from "@lib/params";
import FileUploadPage from "@pageComponents/FileUploadPage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: UploadParams & {
    branchName?: string | null;
    tableName?: string | null;
  };
  stage?: string | null;
};

const DatabaseUploadStagePage: NextPage<Props> = ({ params, stage }) => (
  <Page
    title={`Upload file to ${params.databaseName} - ${stage ?? "Branch"}`}
    noIndex
  >
    <FileUploadPage
      params={{
        ...params,
        branchName: params.branchName ?? undefined,
        tableName: params.tableName ?? undefined,
      }}
      stage={stage ?? undefined}
    />
  </Page>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...(params as UploadParams),
        branchName: query.branchName ? String(query.branchName) : null,
        tableName: query.tableName ? String(query.tableName) : null,
        id: query.id ? String(query.id) : null,
      },
      stage: params?.stage ? String(params.stage) : null,
    },
  };
};

export default DatabaseUploadStagePage;
