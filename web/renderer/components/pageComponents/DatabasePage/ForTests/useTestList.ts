import { useState, useMemo, useEffect } from "react";
import { Test, useRunTestsLazyQuery, useSaveTestsMutation, useTestListQuery } from "@gen/graphql-types";
import { RefParams } from "@lib/params";

// type Test = {
//   id: string;
//   name: string;
//   query: string;
//   type: string;
//   operator: string;
//   expected: string;
//   testGroup: string;
// };

// const initialTests: Test[] = [
//   {
//     id: "1",
//     name: "User Count Check",
//     query: "SELECT COUNT(*) FROM users",
//     type: "Expected Single Value",
//     operator: "=",
//     expected: "100",
//     testGroup: "User Validation"
//   },
//   {
//     id: "2",
//     name: "Active Users Check",
//     query: "SELECT COUNT(*) FROM users WHERE active = 1",
//     type: "Expected Single Value",
//     operator: ">=",
//     expected: "50",
//     testGroup: "User Validation"
//   },
//   {
//     id: "3",
//     name: "Order Total Check",
//     query: "SELECT SUM(total) FROM orders",
//     type: "Expected Single Value",
//     operator: ">",
//     expected: "1000",
//     testGroup: "Financial Tests"
//   },
//   {
//     id: "4",
//     name: "Product Inventory",
//     query: "SELECT COUNT(*) FROM products WHERE stock > 0",
//     type: "Expected Single Value",
//     operator: ">",
//     expected: "10",
//     testGroup: "Inventory Tests"
//   },
//   {
//     id: "5",
//     name: "Revenue by Month",
//     query: "SELECT MONTH(created_at), SUM(total) FROM orders GROUP BY MONTH(created_at)",
//     type: "Expected Rows",
//     operator: ">=",
//     expected: "12",
//     testGroup: "Financial Tests"
//   },
//   {
//     id: "6",
//     name: "Sample Ungrouped Test",
//     query: "SELECT 1",
//     type: "Expected Single Value",
//     operator: "=",
//     expected: "1",
//     testGroup: ""
//   }
// ];

export function useTestList(params: RefParams) {
  const { data, loading, error } = useTestListQuery({
    variables: {
      databaseName: params.databaseName,
      refName: params.refName,
    },
  });
  const [runTests] = useRunTestsLazyQuery();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set()
  );
  const [editingTestNames, setEditingTestNames] = useState<
    Record<string, string>
  >({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [emptyGroups, setEmptyGroups] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, {status: 'passed' | 'failed', error?: string}>>({});
  
  // Update tests when GraphQL data loads
  useEffect(() => {
    if (data?.tests.list) {
      const initialTests = data.tests.list.map(({ __typename, ...test }) => test);
      setTests(initialTests);
    }
  }, [data?.tests.list]);

  const [saveTestsMutation] = useSaveTestsMutation({
    variables: {
      databaseName: params.databaseName,
      refName: params.refName,
      tests: { list: tests }
    },
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const toggleGroupExpanded = (groupName: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupName)) {
      newExpandedGroups.delete(groupName);
    } else {
      newExpandedGroups.add(groupName);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const updateTest = (name: string, field: keyof Test, value: string) => {
    setTests(
      tests.map((test: Test) =>
        test.testName === name ? { ...test, [field]: value } : test,
      ),
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    console.log("Saving all changes:", tests);
    await saveTestsMutation();
    setHasUnsavedChanges(false);
    window.alert("All changes saved successfully!");
  };

  const handleRunTest = async (testName: string) => {
    if (hasUnsavedChanges) {
      await handleSaveAll();
    }
    const result = await runTests({
      variables: {
        databaseName: params.databaseName,
        refName: params.refName,
        identifiers: {
          values: [testName]
        }
      }
    })

    console.log(result)
    //
    // // Mock test execution - randomly pass/fail for demo
    // const willPass = Math.random() > 0.3;
    //
    // if (willPass) {
    //   setTestResults(prev => ({
    //     ...prev,
    //     [testId]: { status: 'passed' }
    //   }));
    // } else {
    //   setTestResults(prev => ({
    //     ...prev,
    //     [testId]: {
    //       status: 'failed',
    //       error: `Assertion failed: expected '${Math.floor(Math.random() * 100)}' but got '${Math.floor(Math.random() * 100)}'`
    //     }
    //   }));
    // }
  };

  const handleRunGroup = async (groupName: string) => {
    if (hasUnsavedChanges) {
      await handleSaveAll();
    }
    
    // Get all tests in the group
    const groupTests = tests.filter(test => test.testGroup === groupName);
    
    // Run each test in the group
    const newResults: Record<string, {status: 'passed' | 'failed', error?: string}> = {};
    
    for (const test of groupTests) {
      const willPass = Math.random() > 0.3;
      
      if (willPass) {
        newResults[test.testName] = { status: 'passed' };
      } else {
        newResults[test.testName] = { 
          status: 'failed', 
          error: `Assertion failed: expected '${Math.floor(Math.random() * 100)}' but got '${Math.floor(Math.random() * 100)}'`
        };
      }
    }
    
    // Update test results
    setTestResults(prev => ({
      ...prev,
      ...newResults
    }));
  };

  const handleDeleteTest = (testName: string) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      setTests(tests.filter(test => test.testName !== testName));
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(testName);
        return newSet;
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleDeleteGroup = (groupName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the entire "${groupName}" group and all its tests?`,
      )
    ) {
      setTests(tests.filter(test => test.testGroup !== groupName));
      setExpandedGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupName);
        return newSet;
      });
      setEmptyGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupName);
        return newSet;
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleCreateGroup = (
    groupName: string,
    groupedTests: Record<string, Test[]>,
  ) => {
    if (
      groupName.trim() &&
      !Object.keys(groupedTests).includes(groupName.trim()) &&
      !emptyGroups.has(groupName.trim())
    ) {
      setEmptyGroups(prev => new Set([...prev, groupName.trim()]));
      setExpandedGroups(prev => new Set([...prev, groupName.trim()]));
      setHasUnsavedChanges(true);
      return true;
    }
    return false;
  };

  const handleCreateTest = (groupName?: string) => {
    const newTest: Test = {
      testName: "New Test",
      testQuery: "",
      assertionType: "expected_single_value",
      assertionComparator: "==",
      assertionValue: "",
      testGroup: groupName ?? "",
    };

    setTests([...tests, newTest]);
    setExpandedItems(prev => new Set([...prev, newTest.testName]));
    setEditingTestNames(prev => {
      return { ...prev, [newTest.testName]: newTest.testName };
    });
    setHasUnsavedChanges(true);

    // Remove from empty groups if test is added to it
    if (groupName && emptyGroups.has(groupName)) {
      setEmptyGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupName);
        return newSet;
      });
    }

    if (groupName && !expandedGroups.has(groupName)) {
      setExpandedGroups(prev => new Set([...prev, groupName]));
    }
    
    // Scroll to new test
    setTimeout(() => {
      const testElement = document.querySelector(`[data-test-name="${newTest.testName}"]`);
      testElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleRenameGroup = (oldName: string, newName: string) => {
    if (newName.trim() && oldName !== newName.trim()) {
      setTests(
        tests.map(test =>
          test.testGroup === oldName
            ? { ...test, testGroup: newName.trim() }
            : test,
        ),
      );

      setExpandedGroups(prev => {
        const newSet = new Set(prev);
        if (newSet.has(oldName)) {
          newSet.delete(oldName);
          newSet.add(newName.trim());
        }
        return newSet;
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleTestNameEdit = (testId: string, name: string) => {
    setEditingTestNames(prev => {
      return {
        ...prev,
        [testId]: name,
      };
    });
  };

  const handleTestNameBlur = (testName: string) => {
    const newName = editingTestNames[testName];
    const test = tests.find(t => t.testName === testName);
    if (newName.trim() && newName !== test?.testName) {
      updateTest(testName, "testName", newName.trim());
    }
    setEditingTestNames(prev => {
      const newState = { ...prev };
      delete newState[testName];
      return newState;
    });
  };

  const groupedTests = useMemo(() => {
    const groups: Record<string, Test[]> = {};
    tests.forEach(test => {
      const groupName = test.testGroup || "";
      groups[groupName] ??= [];
      groups[groupName].push(test);
    });
    
    // Add empty groups
    emptyGroups.forEach(groupName => {
      groups[groupName] ??= [];
    });
    
    return groups;
  }, [tests, emptyGroups]);

  const sortedGroupEntries = useMemo(() => {
    const entries = Object.entries(groupedTests);
    const groupOrder = entries.map(entry => entry[0]);

    entries.sort(([a], [b]) => {
      if (a === "" && b === "") return 0;
      if (a === "") return 1;
      if (b === "") return -1;

      const indexA = groupOrder.indexOf(a);
      const indexB = groupOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return a.localeCompare(b);
    });

    return entries;
  }, [groupedTests]);

  const getGroupResult = (groupName: string) => {
    const groupTests = groupedTests[groupName] || [];
    if (groupTests.length === 0) return undefined;
    
    const results = groupTests.map(test => testResults[test.testName]).filter(Boolean);
    if (results.length === 0) return undefined;
    
    const allPassed = results.every(result => result.status === 'passed');
    return allPassed ? 'passed' : 'failed';
  };

  return {
    expandedItems,
    expandedGroups,
    editingTestNames,
    hasUnsavedChanges,
    tests,
    groupedTests,
    sortedGroupEntries,
    testResults,
    getGroupResult,
    toggleExpanded,
    toggleGroupExpanded,
    updateTest,
    handleRunTest,
    handleRunGroup,
    handleDeleteTest,
    handleDeleteGroup,
    handleCreateGroup,
    handleCreateTest,
    handleSaveAll,
    handleRenameGroup,
    handleTestNameEdit,
    handleTestNameBlur,
  };
}
