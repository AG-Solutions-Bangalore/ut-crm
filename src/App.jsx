import { Route, Routes } from "react-router-dom";
import AppInitializer from "./components/AppInitializer";
import MaintenancePage from "./components/common/MaintenancePage";
import NotFoundPage from "./components/common/NotFoundPage";
import ProtectedLayout from "./components/ProtectedLayout";
import VersionCheck from "./components/VersionCheck";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SignIn from "./pages/auth/SignIn";
import Dashboard from "./pages/home/Dashboard";
import ItemList from "./pages/master/item/item-list";
import MillList from "./pages/master/mill/mill-list";
import PartyForm from "./pages/master/party/party-form";
import PartyList from "./pages/master/party/party-list";
// import DeliveryList from "./pages/master/delivery/delivery-list";
import AuthReport from "./pages/auth-report/AuthReport";
import BillingForm from "./pages/billing/billing-form";
import BillingList from "./pages/billing/billing-list";
import BillingView from "./pages/billing/billing-view";
import MillForm from "./pages/master/mill/mill-form";
import ShadeList from "./pages/master/shade/shade-list";
import UnitList from "./pages/master/unit/unit-list";
import PurchaseForm from "./pages/purchase/purchase-form";
import PurchaseList from "./pages/purchase/purchase-list";
import QuotationForm from "./pages/quotation/quotation-form";
import QuotationList from "./pages/quotation/quotation-list";
import PurchaseOrderTab from "./pages/reportformats/PurchaseOrderTab";
import ReportFormat from "./pages/reportformats/ReportFormat";
import TaxInvoiceForm from "./pages/tax-invoice/tax-invoice-form";
import TaxInvoiceList from "./pages/tax-invoice/tax-invoice-list";

import BalanceCloseOrderReport from "./pages/report/balance/BalanceCloseOrderReport";
import BalanceOrderReport from "./pages/report/balance/BalanceOrderReport";
import BalancePayableReport from "./pages/report/balance/BalancePayableReport";
import MillWiseReport from "./pages/report/mill/MillWiseReport";
import PartyWiseReport from "./pages/report/party/PartyWiseReport";
import PriceRateReport from "./pages/report/price-rate/PriceRateReport";
import SalesReport from "./pages/report/sales/SalesReport";
import PaymentList from "./pages/payment/payment-list";
import PaymentForm from "./pages/payment/payment-form";
import BalanceReceivableReport from "./pages/report/balance/BalanceReceivableReport";
import PartyReport from "./pages/report/party/PartyReport";
import MillReport from "./pages/report/mill/MillReport";
import TradeInvoiceForm from "./pages/trade-invoice/trade-invoice-form";
import TradeInvoiceList from "./pages/trade-invoice/trade-invoice-list";
import ErrorBoundry from "./components/errorBoundry/ErrorBoundry";
import TaxInvoice from "./pages/reportformats/TaxInvoice";
import { DashboardNew } from "./features/dashboard";
import LedgerReport from "./pages/report/ledger/ledger-report";
import QuotationView from "./pages/quotation/quotation-view";

function App() {
  return (
    <AppInitializer>
      <VersionCheck />
      <ErrorBoundry>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/forget-password" element={<ForgotPassword />} />
        <Route path="/maintenance" element={<MaintenancePage />} />

        {/* Protected routes inside layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Dashboard />} />
          <Route path="/home1" element={<DashboardNew />} />
          <Route path="/auth-report" element={<AuthReport />} />
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
          <Route path="/purchase/view/:id" element={<PurchaseOrderTab />} />

          <Route path="/quotation" element={<QuotationList />} />
          <Route path="/quotation/create" element={<QuotationForm />} />
          <Route path="/quotation/edit/:id" element={<QuotationForm />} />
          <Route path="/quotation/view/:id" element={<QuotationView />} />

          <Route path="/billing" element={<BillingList />} />
          <Route path="/billing/create" element={<BillingForm />} />
          <Route path="/billing/edit/:id" element={<BillingForm />} />
          <Route path="/billing/view/:id" element={<BillingView />} />

          <Route path="/tax-invoice" element={<TaxInvoiceList />} />
          <Route path="/tax-invoice/create" element={<TaxInvoiceForm />} />
          <Route path="/tax-invoice/edit/:id" element={<TaxInvoiceForm />} />
          <Route path="/tax-invoice/view/:id" element={<TaxInvoice />} />

          <Route path="/payment" element={<PaymentList />} />
          <Route path="/payment/create" element={<PaymentForm />} />
          <Route path="/payment/edit/:id" element={<PaymentForm />} />

          <Route path="/trade-invoice" element={<TradeInvoiceList />} />
          <Route path="/trade-invoice/create" element={<TradeInvoiceForm />} />
          <Route
            path="/trade-invoice/edit/:id"
            element={<TradeInvoiceForm />}
          />

          <Route path="/report-format" element={<ReportFormat />} />

          {/* report  */}
          <Route
            path="/report/balance-order"
            element={<BalanceOrderReport />}
          />
          <Route
            path="/report/balance-close-order"
            element={<BalanceCloseOrderReport />}
          />
          <Route path="/report/price-rate" element={<PriceRateReport />} />
          <Route path="/report/sales" element={<SalesReport />} />
          <Route path="/report/mill-wise" element={<MillWiseReport />} />
          <Route path="/report/party-wise" element={<PartyWiseReport />} />
          <Route
            path="/report/balance-payable"
            element={<BalancePayableReport />}
          />
          <Route
            path="/report/balance-receivable"
            element={<BalanceReceivableReport />}
          />
          <Route path="/report/party" element={<PartyReport />} />
          <Route path="/report/mill" element={<MillReport />} />
          <Route path="/report/ledger-report" element={<LedgerReport />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </ErrorBoundry>
    </AppInitializer>
  );
}

export default App;
