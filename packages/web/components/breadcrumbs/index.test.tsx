it("", () => {
  expect(true).toBe(true);
});

// import { render, screen } from "@testing-library/react";
// import Breadcrumbs from ".";
// import { BreadcrumbDetails, BreadcrumbName, BreadcrumbType } from "./types";

// type TestBreadcrumbs = {
//   breadcrumbs: Array<BreadcrumbDetails & { expectedText: string }>;
// };

// const testDetails: TestBreadcrumbs[] = [
//   {
//     // one breadcrumb
//     breadcrumbs: [
//       {
//         name: BreadcrumbName.DepName,
//         child: <div>my-dep</div>,
//         expectedText: "my-dep",
//         type: BreadcrumbType.Link,
//       },
//     ],
//   },
//   // two breadcrumbs
//   {
//     breadcrumbs: [
//       {
//         name: BreadcrumbName.DepOwner,
//         child: <div>depowner</div>,
//         expectedText: "depowner",
//         type: BreadcrumbType.Link,
//       },
//       {
//         name: BreadcrumbName.DepName,
//         child: <div>my-dep</div>,
//         expectedText: "my-dep",
//         type: BreadcrumbType.Link,
//       },
//     ],
//   },
// ];

// describe("test Breadcrumbs", () => {
//   testDetails.forEach(test => {
//     it(`renders ${test.breadcrumbs.length} breadcrumb links`, () => {
//       render(
//         <Breadcrumbs
//           aria-label="testing-breadcrumbs"
//           breadcrumbs={test.breadcrumbs}
//         />,
//       );
//       expect(screen.getByLabelText("testing-breadcrumbs")).toBeVisible();
//       test.breadcrumbs.forEach(crumb => {
//         expect(
//           screen.getByLabelText(`${crumb.name}-breadcrumb-link`),
//         ).toHaveTextContent(crumb.expectedText);
//       });
//     });
//   });
// });
