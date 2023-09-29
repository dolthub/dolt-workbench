const nextJest = require("next/jest");

const TEST_REGEX = "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|js?|tsx?|ts?)$";

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest();

// Any custom config you want to pass to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testRegex: TEST_REGEX,
  transform: {
    "^.+\\.tsx?$": "babel-jest",
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy",
    "@components/(.*)": "<rootDir>/components/$1",
    "@pageComponents/(.*)": "<rootDir>/components/pageComponents/$1",
    "@layouts/(.*)": "<rootDir>/components/layouts/$1",
    "@contexts/(.*)": "<rootDir>/contexts/$1",
    "@gen/(.*)": "<rootDir>/gen/$1",
    "@hooks/(.*)": "<rootDir>/hooks/$1",
    "@lib/(.*)": "<rootDir>/lib/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  collectCoverage: false,
};

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
