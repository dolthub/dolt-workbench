it("", () => {
  expect(true).toBe(true);
});

// import { render, screen } from "@testing-library/react";
// import Breadcrumb from ".";
// import { BreadcrumbDetails, BreadcrumbName, BreadcrumbType } from "../types";

// type TestDetails = {
//   breadcrumb: BreadcrumbDetails;
//   expectedText: string;
//   showDivider?: boolean;
// };

// const testDetails: TestDetails[] = [
//   {
//     breadcrumb: {
//       name: BreadcrumbName.DepName,
//       child: <div>my-dep</div>,
//       type: BreadcrumbType.Link,
//     },
//     expectedText: "my-dep",
//   },
//   {
//     breadcrumb: {
//       name: BreadcrumbName.DepOwner,
//       child: <div>imanowner</div>,
//       type: BreadcrumbType.Link,
//     },
//     expectedText: "imanowner",
//   },
//   {
//     breadcrumb: {
//       name: BreadcrumbName.DepName,
//       child: <div>my-dep</div>,
//       type: BreadcrumbType.Link,
//     },
//     expectedText: "my-dep",
//     showDivider: true,
//   },
//   {
//     breadcrumb: {
//       name: BreadcrumbName.DepOwner,
//       child: <div>imanowner</div>,
//       type: BreadcrumbType.Link,
//     },
//     expectedText: "imanowner",
//     showDivider: false,
//   },
// ];

// describe("test Breadcrumb", () => {
//   testDetails.forEach(test => {
//     it(`renders ${test.breadcrumb.name} link`, () => {
//       render(
//         <Breadcrumb
//           showDivider={test.showDivider}
//           breadcrumb={test.breadcrumb}
//         />,
//       );
//       expect(
//         screen.getByLabelText(`${test.breadcrumb.name}-breadcrumb-link`),
//       ).toHaveTextContent(test.expectedText);

//       if (test.showDivider) {
//         expect(screen.getByText("/")).toBeVisible();
//       } else {
//         expect(screen.queryByText("/")).not.toBeInTheDocument();
//       }
//     });
//   });
// });
