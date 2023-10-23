type ReturnType = {
  // depRole: DeploymentRole | undefined;
  userIsAdmin: boolean;
  userHasReadPerms: boolean;
  userHasWritePerms: boolean;
  canWriteToDB: boolean;
  writesEnabled: boolean;
  readOnlyConfig: boolean;
};

export default function useRole(): ReturnType {
  // const { data, ...res } = useDepForDepRoleQuery({
  //   variables: {
  //     deploymentName: params.deploymentName,
  //     ownerName: params.ownerName,
  //   },
  // });
  // const settingsQuery = useWorkbenchSettingsQuery({
  //   variables: {
  //     deploymentName: params.deploymentName,
  //     ownerName: params.ownerName,
  //   },
  // });

  // const [depRole, setDeploymentRole] = useState(data?.deployment.role);
  // const [enableWrites, setEnableWrites] = useState(
  //   !!settingsQuery.data?.workbenchSettings.enableWrites,
  // );
  // const [readOnlyConfig, setReadOnlyConfig] = useState(
  //   getIsReadOnlyConfig(data?.deployment.currentConfigItems),
  // );

  // useEffect(() => {
  //   if (!data) return;
  //   setDeploymentRole(data.deployment.role);
  //   setReadOnlyConfig(getIsReadOnlyConfig(data.deployment.currentConfigItems));
  // }, [data, setDeploymentRole]);

  // useEffect(() => {
  //   if (!settingsQuery.data) return;
  //   setEnableWrites(settingsQuery.data.workbenchSettings.enableWrites);
  // }, [settingsQuery.data, setEnableWrites]);

  // const userIsAdmin = depRole === DeploymentRole.Admin;
  // const userHasWritePerms = userIsAdmin || depRole === DeploymentRole.Writer;
  // const userHasReadPerms =
  //   userHasWritePerms || depRole === DeploymentRole.Reader;
  const userIsAdmin = true;
  const userHasWritePerms = true;
  const userHasReadPerms = true;
  const enableWrites = true;
  const readOnlyConfig = false;

  return {
    // ...res,
    // depRole,
    userIsAdmin,
    userHasWritePerms,
    userHasReadPerms,
    writesEnabled: enableWrites,
    readOnlyConfig,
    canWriteToDB: true,
  };
}

// function getIsReadOnlyConfig(
//   overrides: Maybe<OverrideItemFragment[]>,
// ): boolean {
//   if (!overrides) return false;
//   const readOnlyConfig = overrides.find(o => o.key === "behavior_read_only");
//   return !!readOnlyConfig && readOnlyConfig.value === "true";
// }
