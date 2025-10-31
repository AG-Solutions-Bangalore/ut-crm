import { Route, Routes } from "react-router-dom";
import AppInitializer from "./components/AppInitializer";
import MaintenancePage from "./components/common/MaintenancePage";
import MemberForm from "./components/MemberList/MemberForm";
import ProtectedLayout from "./components/ProtectedLayout";
import VersionCheck from "./components/VersionCheck";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SignIn from "./pages/auth/SignIn";
import EventAttendMember from "./pages/event/EventAttendMember";
import EventList from "./pages/event/EventList";
import EvenRegisterList from "./pages/eventregister/EventRegisterList";
import EventDetailsPage from "./pages/eventtrack/EventDetailsPage";
import EventTrackList from "./pages/eventtrack/EventTrackList";
import Dashboard from "./pages/home/Dashboard";
import CoupleMembersPage from "./pages/member/CoupleMembersPage";
import LifeMembersPage from "./pages/member/LifeMembersPage";
import TrusteMemberPage from "./pages/member/TrusteMemberPage";
import NewRegisterationForm from "./pages/newRegisteration/NewRegisterationForm";
import NewRegisterationList from "./pages/newRegisteration/NewRegisterationList";
import EventDetailsReport from "./pages/report/EventDetailsReport/EventDetailsReport";
import EventReport from "./pages/report/EventReport/EventReport";
import CoupleMemberReport from "./pages/report/MemberReport/CoupleMemberReport";
import LifeMemberReport from "./pages/report/MemberReport/LifeMemberReport";
import TrusteeMemberReport from "./pages/report/MemberReport/TrusteeMemberReport";
import NotRegisterNotScanned from "./pages/report/NotregisteredNotScanned/NotRegisterNotScanned";
import RegisteredNotScanned from "./pages/report/registerednotscanned/RegisteredNotScanned";
import ReportFormat from "./pages/reportformats/ReportFormat";
import NotFoundPage from "./components/common/NotFoundPage";
import MillList from "./pages/mill/mill-list";
import MillForm from "./pages/mill/mill-form";

function App() {
  return (
    <AppInitializer>
      <VersionCheck />
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/forget-password" element={<ForgotPassword />} />
        <Route path="/maintenance" element={<MaintenancePage />} />

        <Route
          path="*"
          element={
            <ProtectedLayout>
              <Routes>
                <Route path="/master/mill" element={<MillList />} />
                <Route path="/master/mill/create" element={<MillForm />} />
                <Route path="/master/mill/:id" element={<MillForm />} />
              </Routes>
            </ProtectedLayout>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppInitializer>
  );
}
export default App;
