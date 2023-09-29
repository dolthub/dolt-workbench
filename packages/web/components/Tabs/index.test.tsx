import { fireEvent, render, screen } from "@testing-library/react";
import { Tab, TabList, TabPanel, Tabs } from ".";

const mocks = [
  { tabWord: "zero", panelWord: "Cero" },
  { tabWord: "one", panelWord: "Uno" },
  { tabWord: "two", panelWord: "Dos" },
];
const testingActiveTab = (
  elementCollection: HTMLElement[],
  activeIndex: number,
) => {
  elementCollection.forEach(currentTab => {
    if (currentTab === elementCollection[activeIndex]) {
      expect(currentTab).toHaveAttribute("aria-label", "active-tab");
      expect(currentTab).not.toHaveAttribute("aria-label", "tab");
    } else {
      expect(currentTab).not.toHaveAttribute("aria-label", "active-tab");
      expect(currentTab).toHaveAttribute("aria-label", "tab");
    }
  });
};

describe("test Tabs", () => {
  it(`renders active tabs and panels correctly`, () => {
    render(
      <Tabs>
        <TabList>
          {mocks.map((mock, i) => (
            <Tab
              index={i}
              data-cy={mock.tabWord}
              key={`tab-${mock.tabWord}`}
              aria-label="tab"
            >
              {mock.tabWord}
            </Tab>
          ))}
        </TabList>
        {mocks.map((mock, i) => (
          <TabPanel index={i} key={`tabPanel-${mock.panelWord}`}>
            {mock.panelWord}
          </TabPanel>
        ))}
      </Tabs>,
    );
    const listItems = screen.getAllByRole("listitem");
    const buttons = screen.getAllByRole("button");

    for (let i = 0; i < mocks.length; i++) {
      if (i !== 0) {
        fireEvent.click(buttons[i]);
      }

      testingActiveTab(listItems, i);
      const firstPage = screen.queryByText("Cero");
      const secondPage = screen.queryByText("Uno");
      const thirdPage = screen.queryByText("Dos");
      const pages = [firstPage, secondPage, thirdPage];

      pages.forEach((page, idx) => {
        if (i === idx) {
          expect(page).toBeInTheDocument();
        } else {
          expect(page).not.toBeInTheDocument();
        }
      });
    }
  });
  it(`renders initialActiveIndex correctly`, () => {
    render(
      <Tabs initialActiveIndex={2}>
        <TabList aria-label="tabList">
          {mocks.map((mock, i) => (
            <Tab
              index={i}
              data-cy={mock.tabWord}
              key={`tab-${mock.tabWord}`}
              aria-label="tab"
            >
              {mock.tabWord}
            </Tab>
          ))}
        </TabList>
        {mocks.map((mock, i) => (
          <TabPanel index={i} key={`tabPanel-${mock.panelWord}`}>
            {mock.panelWord}
          </TabPanel>
        ))}
      </Tabs>,
    );

    const listItems = screen.getAllByRole("listitem");

    testingActiveTab(listItems, 2);

    const firstPage = screen.queryByText("Cero");
    const secondPage = screen.queryByText("Uno");
    const thirdPage = screen.queryByText("Dos");

    expect(thirdPage).toBeInTheDocument();
    expect(firstPage).not.toBeInTheDocument();
    expect(secondPage).not.toBeInTheDocument();
  });
});
