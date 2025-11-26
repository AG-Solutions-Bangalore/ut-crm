
import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AppInitializer from "./components/AppInitializer";
import ProtectedLayout from "./components/ProtectedLayout";
import VersionCheck from "./components/VersionCheck";
import ErrorBoundry from "./components/errorBoundry/ErrorBoundry";

import MaintenancePage from "./components/common/MaintenancePage";
import NotFoundPage from "./components/common/NotFoundPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SignIn from "./pages/auth/SignIn";

import LazyLoad from "./components/common/LazyLoad";

// Lazy Imports
const Dashboard = lazy(() => import("./pages/home/Dashboard"));
const MillList = lazy(() => import("./pages/master/mill/mill-list"));
const MillForm = lazy(() => import("./pages/master/mill/mill-form"));
const MillReport = lazy(() => import("./pages/report/mill/MillReport"));

const PartyList = lazy(() => import("./pages/master/party/party-list"));
const PartyForm = lazy(() => import("./pages/master/party/party-form"));
const PartyReport = lazy(() => import("./pages/report/party/PartyReport"));

const ItemList = lazy(() => import("./pages/master/item/item-list"));
const UnitList = lazy(() => import("./pages/master/unit/unit-list"));
const ShadeList = lazy(() => import("./pages/master/shade/shade-list"));

const PurchaseList = lazy(() => import("./pages/purchase/purchase-list"));
const PurchaseForm = lazy(() => import("./pages/purchase/purchase-form"));
const PurchaseView = lazy(() =>
  import("./pages/reportformats/PurchaseOrderTab")
);

const QuotationList = lazy(() => import("./pages/quotation/quotation-list"));
const QuotationForm = lazy(() => import("./pages/quotation/quotation-form"));
const QuotationView = lazy(() => import("./pages/quotation/quotation-view"));

const BillingList = lazy(() => import("./pages/billing/billing-list"));
const BillingForm = lazy(() => import("./pages/billing/billing-form"));
const BillingView = lazy(() => import("./pages/billing/billing-view"));

const PaymentList = lazy(() => import("./pages/payment/payment-list"));
const PaymentForm = lazy(() => import("./pages/payment/payment-form"));

const TaxInvoiceList = lazy(() =>
  import("./pages/tax-invoice/tax-invoice-list")
);
const TaxInvoiceForm = lazy(() =>
  import("./pages/tax-invoice/tax-invoice-form")
);
const TaxInvoiceView = lazy(() => import("./pages/reportformats/TaxInvoice"));

const TradeInvoiceList = lazy(() =>
  import("./pages/trade-invoice/trade-invoice-list")
);
const TradeInvoiceForm = lazy(() =>
  import("./pages/trade-invoice/trade-invoice-form")
);
const TradeInvoiceView = lazy(() =>
  import("./pages/trade-invoice/trade-invoice-view")
);
const AuthReport = lazy(() => import("./pages/auth-report/AuthReport"));
const ReportFormat = lazy(() => import("./pages/reportformats/ReportFormat"));

const BalanceOrderTabs = lazy(() =>
  import("./pages/report/balance/BalanceOrderTabs")
);
const BalanceOrderTabsOne = lazy(() =>
  import("./pages/report/balance/BalanceOrderTabsOne")
);

const PriceRateReport = lazy(() =>
  import("./pages/report/price-rate/PriceRateReport")
);
const SalesReport = lazy(() => import("./pages/report/sales/SalesReport"));
const MillWiseReport = lazy(() => import("./pages/report/mill/MillWiseReport"));
const PartyWiseReport = lazy(() =>
  import("./pages/report/party/PartyWiseReport")
);
const LedgerReport = lazy(() => import("./pages/report/ledger/ledger-report"));

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

          {/* Protected */}
          <Route element={<ProtectedLayout />}>
            <Route
              path="/home"
              element={
                <LazyLoad>
                  <Dashboard />
                </LazyLoad>
              }
            />

            {/* Mill */}
            <Route
              path="/master/mill"
              element={
                <LazyLoad>
                  <MillList />
                </LazyLoad>
              }
            />
            <Route
              path="/master/mill/create"
              element={
                <LazyLoad>
                  <MillForm />
                </LazyLoad>
              }
            />
            <Route
              path="/master/mill/:id"
              element={
                <LazyLoad>
                  <MillForm />
                </LazyLoad>
              }
            />
            <Route
              path="/master/mill/report"
              element={
                <LazyLoad>
                  <MillReport />
                </LazyLoad>
              }
            />

            {/* Party */}
            <Route
              path="/master/party"
              element={
                <LazyLoad>
                  <PartyList />
                </LazyLoad>
              }
            />
            <Route
              path="/master/party/create"
              element={
                <LazyLoad>
                  <PartyForm />
                </LazyLoad>
              }
            />
            <Route
              path="/master/party/:id"
              element={
                <LazyLoad>
                  <PartyForm />
                </LazyLoad>
              }
            />
            <Route
              path="/master/party/report"
              element={
                <LazyLoad>
                  <PartyReport />
                </LazyLoad>
              }
            />

            {/* Others */}
            <Route
              path="/master/item"
              element={
                <LazyLoad>
                  <ItemList />
                </LazyLoad>
              }
            />
            <Route
              path="/master/unit"
              element={
                <LazyLoad>
                  <UnitList />
                </LazyLoad>
              }
            />
            <Route
              path="/master/shade"
              element={
                <LazyLoad>
                  <ShadeList />
                </LazyLoad>
              }
            />

            {/* Purchase */}
            <Route
              path="/purchase"
              element={
                <LazyLoad>
                  <PurchaseList />
                </LazyLoad>
              }
            />
            <Route
              path="/purchase/create"
              element={
                <LazyLoad>
                  <PurchaseForm />
                </LazyLoad>
              }
            />
            <Route
              path="/purchase/edit/:id"
              element={
                <LazyLoad>
                  <PurchaseForm />
                </LazyLoad>
              }
            />
            <Route
              path="/purchase/view/:id"
              element={
                <LazyLoad>
                  <PurchaseView />
                </LazyLoad>
              }
            />

            {/* Quotation */}
            <Route
              path="/quotation"
              element={
                <LazyLoad>
                  <QuotationList />
                </LazyLoad>
              }
            />
            <Route
              path="/quotation/create"
              element={
                <LazyLoad>
                  <QuotationForm />
                </LazyLoad>
              }
            />
            <Route
              path="/quotation/edit/:id"
              element={
                <LazyLoad>
                  <QuotationForm />
                </LazyLoad>
              }
            />
            <Route
              path="/quotation/view/:id"
              element={
                <LazyLoad>
                  <QuotationView />
                </LazyLoad>
              }
            />

            {/* Billing */}
            <Route
              path="/billing"
              element={
                <LazyLoad>
                  <BillingList />
                </LazyLoad>
              }
            />
            <Route
              path="/billing/create"
              element={
                <LazyLoad>
                  <BillingForm />
                </LazyLoad>
              }
            />
            <Route
              path="/billing/edit/:id"
              element={
                <LazyLoad>
                  <BillingForm />
                </LazyLoad>
              }
            />
            <Route
              path="/billing/view/:id"
              element={
                <LazyLoad>
                  <BillingView />
                </LazyLoad>
              }
            />

            {/* Tax Invoice */}
            <Route
              path="/tax-invoice"
              element={
                <LazyLoad>
                  <TaxInvoiceList />
                </LazyLoad>
              }
            />
            <Route
              path="/tax-invoice/create"
              element={
                <LazyLoad>
                  <TaxInvoiceForm />
                </LazyLoad>
              }
            />
            <Route
              path="/tax-invoice/edit/:id"
              element={
                <LazyLoad>
                  <TaxInvoiceForm />
                </LazyLoad>
              }
            />
            <Route
              path="/tax-invoice/view/:id"
              element={
                <LazyLoad>
                  <TaxInvoiceView />
                </LazyLoad>
              }
            />

            {/* Payment */}
            <Route
              path="/payment"
              element={
                <LazyLoad>
                  <PaymentList />
                </LazyLoad>
              }
            />
            <Route
              path="/payment/create"
              element={
                <LazyLoad>
                  <PaymentForm />
                </LazyLoad>
              }
            />
            <Route
              path="/payment/edit/:id"
              element={
                <LazyLoad>
                  <PaymentForm />
                </LazyLoad>
              }
            />

            {/* Trade Invoice */}
            <Route
              path="/trade-invoice"
              element={
                <LazyLoad>
                  <TradeInvoiceList />
                </LazyLoad>
              }
            />
            <Route
              path="/trade-invoice/create"
              element={
                <LazyLoad>
                  <TradeInvoiceForm />
                </LazyLoad>
              }
            />
            <Route
              path="/trade-invoice/edit/:id"
              element={
                <LazyLoad>
                  <TradeInvoiceForm />
                </LazyLoad>
              }
            />
            <Route
              path="/trade-invoice/view/:id"
              element={
                <LazyLoad>
                  <TradeInvoiceView />
                </LazyLoad>
              }
            />

            {/* Report Format */}
            <Route
              path="/report-format"
              element={
                <LazyLoad>
                  <ReportFormat />
                </LazyLoad>
              }
            />

            {/* Reports */}

            <Route
              path="/auth-report"
              element={
                <LazyLoad>
                  <AuthReport />
                </LazyLoad>
              }
            />
            <Route
              path="/report/balance-order"
              element={
                <LazyLoad>
                  <BalanceOrderTabs />
                </LazyLoad>
              }
            />
            <Route
              path="/report/price-rate"
              element={
                <LazyLoad>
                  <PriceRateReport />
                </LazyLoad>
              }
            />
            <Route
              path="/report/sales"
              element={
                <LazyLoad>
                  <SalesReport />
                </LazyLoad>
              }
            />
            <Route
              path="/report/mill-wise"
              element={
                <LazyLoad>
                  <MillWiseReport />
                </LazyLoad>
              }
            />
            <Route
              path="/report/party-wise"
              element={
                <LazyLoad>
                  <PartyWiseReport />
                </LazyLoad>
              }
            />
            <Route
              path="/report/balance"
              element={
                <LazyLoad>
                  <BalanceOrderTabsOne />
                </LazyLoad>
              }
            />
            <Route
              path="/report/ledger-report"
              element={
                <LazyLoad>
                  <LedgerReport />
                </LazyLoad>
              }
            />
          </Route>

          {/* Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundry>
    </AppInitializer>
  );
}

export default App;
