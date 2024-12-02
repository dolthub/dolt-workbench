import { DatabaseParams  } from "@lib/params";
import Breadcrumbs from ".";
import { remoteBreadcrumbDetails } from "./breadcrumbDetails";

type Props = {
  params: DatabaseParams;
  className?: string;
};

export default function RemotesBreadcrumbs(props: Props) {
    return (
        <Breadcrumbs
          {...props}
          aria-label="db-remotes-breadcrumbs"
          data-cy="db-remotes-breadcrumbs"
          breadcrumbs={remoteBreadcrumbDetails(props.params)}
        />
      );
}