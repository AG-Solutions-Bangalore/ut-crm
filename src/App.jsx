import { Route, Routes } from "react-router-dom";
import AppInitializer from "./components/AppInitializer";
import MaintenancePage from "./components/common/MaintenancePage";
import NotFoundPage from "./components/common/NotFoundPage";
import ProtectedLayout from "./components/ProtectedLayout";
import VersionCheck from "./components/VersionCheck";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SignIn from "./pages/auth/SignIn";
import MillList from "./pages/master/mill/mill-list";
import PartyForm from "./pages/master/party/party-form";
import PartyList from "./pages/master/party/party-list";
import Dashboard from "./pages/home/Dashboard";
import ItemList from "./pages/master/item/item-list";
// import DeliveryList from "./pages/master/delivery/delivery-list";
import UnitList from "./pages/master/unit/unit-list";
import ShadeList from "./pages/master/shade/shade-list";
import MillForm from "./pages/master/mill/mill-form";
import PurchaseList from "./pages/purchase/PurchaseList";
import PurchaseForm from "./pages/purchase/PurchaseForm";

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

          <Route path="/master/item" element={<ItemList />} />
          {/* <Route path="/master/delivery" element={<DeliveryList />} /> */}
          <Route path="/master/unit" element={<UnitList />} />
          <Route path="/master/shade" element={<ShadeList />} />

          <Route path="/purchase" element={<PurchaseList />} />
          <Route path="/purchase/create" element={<PurchaseForm />} />
          <Route path="/purchase/edit/:id" element={<PurchaseForm />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppInitializer>
  );
}

export default App;
