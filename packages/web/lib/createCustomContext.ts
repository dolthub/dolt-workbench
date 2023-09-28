import { Context, createContext } from "react";

// Creates a React.Context with a required display name and undefined default value.
// displayName is used to identify the context being used in `useContextWithError` in shared-components.
export function createCustomContext<T>(displayName: string): Context<T> {
  const newContext = createContextWithNoDefault<T>();
  newContext.displayName = displayName;
  return newContext;
}

// Creates a React.Context with a default value and display name.
export function createContextWithDisplayName<T>(
  defaultValue: T,
  displayName: string,
): Context<T> {
  const newContext = createContext<T>(defaultValue);
  newContext.displayName = displayName;
  return newContext;
}

// Creates a React.Context with an undefined default value.
// We do not want to define a default value when we want an error
// to be thrown if the context hook is not used in a component with the
// corresponding Provider component.
function createContextWithNoDefault<T>(): Context<T> {
  return createContext<T>(undefined as any);
}
