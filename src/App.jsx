import { Route, Routes } from "react-router-dom";
import AppInitializer from "./components/AppInitializer";
import MaintenancePage from "./components/common/MaintenancePage";
import NotFoundPage from "./components/common/NotFoundPage";
import ProtectedLayout from "./components/ProtectedLayout";
import VersionCheck from "./components/VersionCheck";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SignIn from "./pages/auth/SignIn";
import MillForm from "./pages/mill/mill-form";
import MillList from "./pages/mill/mill-list";
import PartyForm from "./pages/party/party-form";
import PartyList from "./pages/party/party-list";
import Dashboard from "./pages/home/Dashboard";
import BfList from "./pages/bf/bf-list";
import DeliveryList from "./pages/delivery/delivery-list";
import UnitList from "./pages/unit/unit-list";
import ShadeList from "./pages/shade/shade-list";
import SubjectList from "./pages/subject/subject-list";
import DeckleList from "./pages/deckle/deckle-list";
import GsmList from "./pages/gsm/gsm-list";

function App() {
  return (
    <AppInitializer>
      <VersionCheck />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/forget-password" element={<ForgotPassword />} />
        <Route path="/maintenance" element={<MaintenancePage />} />

        {/* Protected routes inside layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Dashboard />} />
          <Route path="/master/mill" element={<MillList />} />
          <Route path="/master/mill/create" element={<MillForm />} />
          <Route path="/master/mill/:id" element={<MillForm />} />

          <Route path="/master/party" element={<PartyList />} />
          <Route path="/master/party/create" element={<PartyForm />} />
          <Route path="/master/party/:id" element={<PartyForm />} />
         
          <Route path="/master/bf" element={<BfList />} />
          <Route path="/master/delivery" element={<DeliveryList />} />
          <Route path="/master/unit" element={<UnitList />} />
          <Route path="/master/shade" element={<ShadeList />} />
          <Route path="/master/subject" element={<SubjectList />} />
          <Route path="/master/deckle" element={<DeckleList />} />
          <Route path="/master/gsm" element={<GsmList />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppInitializer>
  );
}

export default App;
