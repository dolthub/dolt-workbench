import { useDefaultBranchPageQuery } from "@gen/graphql-types";
import useRole from "@hooks/useRole";
import { DatabaseParams, UploadParams } from "@lib/params";
import { ReactNode } from "react";
import Loader from "../../Loader";
import Page404 from "../../Page404";
import QueryHandler from "../../util/QueryHandler";
import Layout from "./Layout";
import { FileUploadLocalForageProvider } from "./contexts/fileUploadLocalForage";
import css from "./index.module.css";

type Props = {
  params: UploadParams & {
    branchName?: string;
    tableName?: string;
  };
  children: ReactNode;
};

export default function PageWrapper(props: Props) {
  const { userHasWritePerms, loading } = useRole();
  const res = useDefaultBranchPageQuery({
    variables: { ...props.params, filterSystemTables: true },
  });
  const dbParams = {
    databaseName: props.params.databaseName,
  };

  if (loading) return <Loader loaded={false} />;
  if (!userHasWritePerms) return <PermsError params={dbParams} />;

  return (
    <Layout params={dbParams}>
      <QueryHandler
        result={res}
        render={() => (
          <FileUploadLocalForageProvider params={props.params}>
            {props.children}
          </FileUploadLocalForageProvider>
        )}
      />
    </Layout>
  );
}

function PermsError(props: { params: DatabaseParams }) {
  return (
    <Layout params={props.params}>
      <div>
        <Page404
          title={`Cannot edit ${props.params.databaseName}`}
          error={new Error("must have write permissions to edit data")}
        >
          <div className={css.noPerms}>
            <div>
              You must have write permissions to create a new table or upload a
              file
            </div>
          </div>
        </Page404>
      </div>
    </Layout>
  );
}
