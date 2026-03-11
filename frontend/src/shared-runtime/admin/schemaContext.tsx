import { createContext, useContext } from "react";
import type { AdminSchema } from "./resourceMetadata";

export const SchemaContext = createContext<AdminSchema | null>(null);

export function useSchema() {
  const schema = useContext(SchemaContext);
  if (!schema) {
    throw new Error("SchemaContext is not available");
  }
  return schema;
}
