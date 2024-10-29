import ReleasesBreadcrumbs from "@components/breadcrumbs/ReleasesBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { OptionalRefParams } from "@lib/params";
import { releases } from "@lib/urls";
import ForDefaultBranch from "../ForDefaultBranch";
import NewReleasePage from "./NewReleasePage";
import ReleaseList from "./ReleaseList";

type Props = {
  params: OptionalRefParams;
  newRelease?: boolean;
};

export default function ForReleases(props: Props): JSX.Element {
  const feature = props.newRelease ? "Creating releases" : "Viewing releases";
  return (
    <ForDefaultBranch
      params={props.params}
      initialTabIndex={3}
      hideDefaultTable
      smallHeaderBreadcrumbs={
        <ReleasesBreadcrumbs params={props.params} new={props.newRelease} />
      }
      title="releases"
      routeRefChangeTo={releases}
    >
      <NotDoltWrapper showNotDoltMsg feature={feature} bigMsg>
        {props.newRelease ? (
          <NewReleasePage params={props.params} />
        ) : (
          <ReleaseList params={props.params} />
        )}
      </NotDoltWrapper>
    </ForDefaultBranch>
  );
}
