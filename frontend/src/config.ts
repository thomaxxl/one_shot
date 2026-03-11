export const config = {
  apiRoot: import.meta.env.VITE_API_ROOT || "/api",
  adminYamlUrl: import.meta.env.VITE_ADMIN_YAML_URL || "/ui/admin/admin.yaml",
  backendOrigin: import.meta.env.VITE_BACKEND_ORIGIN || "http://127.0.0.1:5656",
};
