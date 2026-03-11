import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { SchemaDrivenAdminApp } from "./shared-runtime/SchemaDrivenAdminApp";
import { config } from "./config";
import { resourcePages } from "./generated/resourcePages";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0f3d57" },
    secondary: { main: "#d97706" },
    background: { default: "#eef6fb" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    h5: { fontWeight: 700 },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SchemaDrivenAdminApp
        adminYamlUrl={config.adminYamlUrl}
        apiRoot={config.apiRoot}
        resources={resourcePages}
        title="Airport Management"
      />
    </ThemeProvider>
  );
}
