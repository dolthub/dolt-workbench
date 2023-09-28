import React from "react";

export default function useContextWithError<T>(ctx: React.Context<T>): T {
  const context = React.useContext(ctx);
  if (context === undefined) {
    console.error(
      `useContext must be used within a child of ContextProvider for context: ${ctx.displayName}`,
    );
  }
  return context;
}
