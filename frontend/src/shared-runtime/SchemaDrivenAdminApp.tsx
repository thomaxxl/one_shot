import { CircularProgress, Stack } from "@mui/material";
import { Admin } from "react-admin";
import { useEffect, useState } from "react";
import { parse } from "yaml";
import { SchemaContext } from "./admin/schemaContext";
import { buildResources } from "./resourceRegistry";
import { createSearchEnabledDataProvider } from "./admin/createSearchEnabledDataProvider";
import type { AdminSchema, ResourcePages } from "./admin/resourceMetadata";

type Props = {
  adminYamlUrl: string;
  apiRoot: string;
  resources: ResourcePages[];
  title: string;
};

export function SchemaDrivenAdminApp({
  adminYamlUrl,
  apiRoot,
  resources,
  title,
}: Props) {
  const [schema, setSchema] = useState<AdminSchema | null>(null);

  useEffect(() => {
    fetch(adminYamlUrl)
      .then((response) => response.text())
      .then((text) => setSchema(parse(text) as AdminSchema));
  }, [adminYamlUrl]);

  if (!schema) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress />
      </Stack>
    );
  }

  const dataProvider = createSearchEnabledDataProvider(schema, apiRoot);

  return (
    <SchemaContext.Provider value={schema}>
      <Admin dataProvider={dataProvider} title={title}>
        {buildResources(resources)}
      </Admin>
    </SchemaContext.Provider>
  );
}
