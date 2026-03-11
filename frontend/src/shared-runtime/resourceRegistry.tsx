import { Resource } from "react-admin";
import type { ReactNode } from "react";
import type { ResourcePages } from "./admin/resourceMetadata";

export function buildResources(resources: ResourcePages[]): ReactNode[] {
  return resources.map((resource) => (
    <Resource
      key={resource.name}
      name={resource.name}
      list={resource.list}
      create={resource.create}
      edit={resource.edit}
      show={resource.show}
      recordRepresentation={resource.recordRepresentation}
    />
  ));
}
