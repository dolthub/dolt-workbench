import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { RefParams } from "@lib/params";
import { tests as testsUrl } from "@lib/urls";
import ForDefaultBranch from "../ForDefaultBranch";
import TestList from "./TestList";

type Props = {
  params: RefParams;
};

export default function ForTests(props: Props): JSX.Element {
  const feature = "Viewing tests";
  return (
    <ForDefaultBranch
      params={props.params}
      initialTabIndex={6}
      hideDefaultTable
      title="tests"
      routeRefChangeTo={testsUrl}
    >
      <NotDoltWrapper showNotDoltMsg feature={feature} bigMsg>
        <TestList params={props.params} />
      </NotDoltWrapper>
    </ForDefaultBranch>
  );
}
