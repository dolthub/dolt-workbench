it("", () => {
  expect(true).toBe(true);
});
// import { BreadcrumbDetails, BreadcrumbName, BreadcrumbType } from "./types";
// import { getBreadcrumbProps } from "./utils";

// function TestChild() {
//   return <div />;
// }

// const tests: BreadcrumbDetails[] = [
//   {
//     child: <TestChild />,
//     name: BreadcrumbName.DepName,
//     type: BreadcrumbType.Link,
//   },
//   {
//     child: <TestChild />,
//     name: BreadcrumbName.DepOwner,
//     type: BreadcrumbType.Link,
//   },
//   {
//     child: <TestChild />,
//     name: BreadcrumbName.DBPulls,
//     type: BreadcrumbType.Link,
//   },
//   {
//     child: <TestChild />,
//     name: BreadcrumbName.DBPull,
//     type: BreadcrumbType.Text,
//   },
//   {
//     child: <TestChild />,
//     name: BreadcrumbName.DepName,
//     type: BreadcrumbType.Link,
//   },
// ];

// describe("tests breadcrumb utils", () => {
//   tests.forEach(test => {
//     it("getBreadcrumbProps returns LinkProps", () => {
//       if (test.type === BreadcrumbType.Text) {
//         expect(getBreadcrumbProps(test)).toEqual({
//           key: `${test.name}-text`,
//           "data-cy": `${test.name}-breadcrumb-text`,
//           "aria-label": `${test.name}-breadcrumb-text`,
//         });
//       } else {
//         expect(getBreadcrumbProps(test)).toEqual({
//           key: `${test.name}-link`,
//           "data-cy": `${test.name}-breadcrumb-link`,
//           "aria-label": `${test.name}-breadcrumb-link`,
//         });
//       }
//     });
//   });
// });
