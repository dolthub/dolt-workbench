import SmallLoader from "@components/SmallLoader";
import Tooltip from "@components/Tooltip";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { useGetBranchQuery, useGetTagQuery } from "@gen/graphql-types";
import useDefaultBranch from "@hooks/useDefaultBranch";
import useIsDolt from "@hooks/useIsDolt";
import { OptionalRefParams, RefParams } from "@lib/params";
import NavItem from "./Item";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams & {
    tableName?: string;
    active?: string;
  };
  initialTabIndex: number;
};

type QueryProps = Props & {
  params: RefParams & {
    tableName?: string;
    active?: string;
  };
};

const tabs = ["Database", "About", "Commit Log", "Releases", "Pull Requests"];

export default function DatabaseNav(props: Props) {
  const { isDolt } = useIsDolt();
  if (props.params.refName && isDolt) {
    return (
      <Query
        {...props}
        params={{ ...props.params, refName: props.params.refName }}
      />
    );
  }

  return <Inner {...props} />;
}

function Query(props: QueryProps) {
  const { defaultBranchName } = useDefaultBranch(props.params);

  const checkBranchExistRes = useGetBranchQuery({
    variables: {
      databaseName: props.params.databaseName,
      branchName: props.params.refName,
    },
  });

  const tagRes = useGetTagQuery({
    variables: {
      databaseName: props.params.databaseName,
      tagName: props.params.refName,
    },
  });

  if (tagRes.loading || checkBranchExistRes.loading) {
    return (
      <SmallLoader loaded={!tagRes.loading || !checkBranchExistRes.loading} />
    );
  }

  const params = {
    ...props.params,
    refName:
      checkBranchExistRes.data?.branch || tagRes.data?.tag
        ? props.params.refName
        : defaultBranchName,
  };

  return <Inner {...props} params={params} />;
}

function Inner(props: Props) {
  return (
    <div data-cy="db-page-header-nav" className={css.headerNav}>
      <Tooltip id="disabled-database-nav-item" />
      <ul className={css.tabs}>
        {tabs.map((tab, i) => {
          const item = <NavItem {...props} key={tab} name={tab} i={i} />;
          if (tab === "Database") {
            return item;
          }
          return <NotDoltWrapper key={tab}>{item}</NotDoltWrapper>;
        })}
      </ul>
    </div>
  );
}
