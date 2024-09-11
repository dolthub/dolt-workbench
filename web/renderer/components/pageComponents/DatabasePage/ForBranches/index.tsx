import BranchesBreadcrumbs from "@components/breadcrumbs/BranchesBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { OptionalRefParams } from "@lib/params";
import { branches } from "@lib/urls";
import ForDefaultBranch from "../ForDefaultBranch";
import BranchesPage from "./BranchesPage";
import NewBranchPage from "./NewBranchPage";

type Props = {
  params: OptionalRefParams;
  newBranch?: boolean;
};

export default function ForBranches({ params, newBranch }: Props): JSX.Element {
  const feature = newBranch ? "Creating new branches" : "Viewing branches";
  return (
    <ForDefaultBranch
      initialTabIndex={0}
      params={params}
      hideDefaultTable
      smallHeaderBreadcrumbs={
        <BranchesBreadcrumbs params={params} new={newBranch} />
      }
      routeRefChangeTo={urlParams => branches(urlParams)}
    >
      <NotDoltWrapper showNotDoltMsg feature={feature} bigMsg>
        {newBranch ? (
          <NewBranchPage params={params} />
        ) : (
          <BranchesPage params={params} />
        )}
      </NotDoltWrapper>
    </ForDefaultBranch>
  );
}
