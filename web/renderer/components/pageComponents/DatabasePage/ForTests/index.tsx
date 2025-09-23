import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { RefParams } from "@lib/params";
import { tests as testsUrl } from "@lib/urls";
import ForDefaultBranch from "../ForDefaultBranch";
import TestList from "./TestList";
import { TestProvider } from "./context";

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
        <TestProvider params={props.params}>
          <TestList params={props.params} />
        </TestProvider>
      </NotDoltWrapper>
    </ForDefaultBranch>
  );
}
