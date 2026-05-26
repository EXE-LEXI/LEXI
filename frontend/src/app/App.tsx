import { AppLayout } from "../components/layout/AppLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { API_BASE_URL } from "../api/config";
import { ROUTES } from "../routes/paths";

function App() {
  return (
    <AppLayout>
      <DashboardPage apiBaseUrl={API_BASE_URL} routes={ROUTES} />
    </AppLayout>
  );
}

export default App;
