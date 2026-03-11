import type { ComponentType } from "react";

export type AttributeType = "text" | "number" | "boolean" | "datetime" | "reference";

export type ResourceAttribute = {
  type: AttributeType;
  required?: boolean;
  readonly?: boolean;
  reference?: string;
};

export type ResourceSchema = {
  endpoint: string;
  user_key: string;
  label?: string;
  attributes: Record<string, ResourceAttribute>;
  tab_groups?: Record<string, { label: string; relationships: string[] }>;
};

export type AdminSchema = {
  resources: Record<string, ResourceSchema>;
};

export type ResourcePages = {
  name: string;
  list: ComponentType;
  create: ComponentType;
  edit: ComponentType;
  show: ComponentType;
  recordRepresentation: string;
};
