import NavItem from "./Item";
import css from "./index.module.css";

type Props = {
  params: {
    refName?: string;
    tableName?: string;
    active?: string;
  };
  initialTabIndex: number;
};

const tabs = ["Database"];

export default function DatabaseNav(props: Props) {
  return <Inner {...props} />;
}

// function Query(props: QueryProps) {
//   const { defaultBranchName } = useDefaultBranch(props.params);

//   const checkBranchExistRes = useGetBranchForPullQuery({
//     variables: {
//       ownerName: props.params.ownerName,
//       deploymentName: props.params.deploymentName,
//       databaseName: props.params.databaseName,
//       branchName: props.params.refName,
//     },
//   });

//   const tagRes = useGetTagQuery({
//     variables: {
//       ownerName: props.params.ownerName,
//       deploymentName: props.params.deploymentName,
//       databaseName: props.params.databaseName,
//       tagName: props.params.refName,
//     },
//   });

//   if (tagRes.loading || checkBranchExistRes.loading) {
//     return (
//       <SmallLoader loaded={!tagRes.loading || !checkBranchExistRes.loading} />
//     );
//   }

//   const params = {
//     ...props.params,
//     refName:
//       checkBranchExistRes.data?.branch || tagRes.data?.tag
//         ? props.params.refName
//         : defaultBranchName,
//   };

//   return <Inner {...props} params={params} />;
// }

function Inner(props: Props) {
  return (
    <div data-cy="db-page-header-nav" className={css.headerNav}>
      <ul className={css.tabs}>
        {tabs.map((tab, i) => (
          <NavItem {...props} key={tab} name={tab} i={i} />
        ))}
      </ul>
    </div>
  );
}
