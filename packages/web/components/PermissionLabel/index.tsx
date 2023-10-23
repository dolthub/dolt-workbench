import useRole from "@hooks/useRole";
import cx from "classnames";
import css from "./index.module.css";

type InnerProps = {
  // params: DeploymentParams;
  className?: string;
};

export default function PermissionLabel({ className }: InnerProps) {
  const { writesEnabled } = useRole();
  // if (!depRole) return null;

  if (!writesEnabled) {
    return (
      <div
        aria-label="db-permission-label"
        className={cx(css.label, className)}
        data-cy="db-permission"
      >
        <span>Read Only</span>
      </div>
    );
  }

  return (
    <div
      aria-label="db-permission-label"
      className={cx(css.label, className)}
      data-cy="db-permission"
    >
      <span>Admin</span>
    </div>
  );
}

// export function getDeploymentRole(r: DeploymentRole): string {
//   switch (r) {
//     case DeploymentRole.Reader:
//       return "Read";
//     case DeploymentRole.Writer:
//       return "Write";
//     default:
//       return r;
//   }
// }
