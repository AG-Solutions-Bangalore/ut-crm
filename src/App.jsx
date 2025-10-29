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
                <Route path="/home" element={<Dashboard />} />
                <Route path="/event" element={<EventList />} />
                <Route
                  path="/event-attend-member/:id"
                  element={<EventAttendMember />}
                />
                <Route path="/event-register" element={<EvenRegisterList />} />
                <Route path="/event-track" element={<EventTrackList />} />
                <Route
                  path="/new-registration-list"
                  element={<NewRegisterationList />}
                />
                <Route
                  path="/new-registration-form/:newId"
                  element={<NewRegisterationForm />}
                />
                <Route path="/life-member" element={<LifeMembersPage />} />
                <Route path="/couple-member" element={<CoupleMembersPage />} />
                <Route path="/truste-member" element={<TrusteMemberPage />} />
                <Route
                  path="/members/edit/:memberId"
                  element={<MemberForm />}
                />
                <Route path="/event-details" element={<EventDetailsPage />} />
                <Route
                  path="/report-life-member"
                  element={<LifeMemberReport />}
                />
                <Route
                  path="/report-couple-member"
                  element={<CoupleMemberReport />}
                />
                <Route
                  path="/report-truste-member"
                  element={<TrusteeMemberReport />}
                />
                <Route path="/report-event" element={<EventReport />} />
                <Route
                  path="/report-event-details"
                  element={<EventDetailsReport />}
                />
                <Route
                  path="/report-register-notscanned"
                  element={<RegisteredNotScanned />}
                />
                <Route
                  path="/report-notregister-notscanned"
                  element={<NotRegisterNotScanned />}
                />
              </Routes>
            </ProtectedLayout>
          }
        />
      </Routes>
    </AppInitializer>
  );
}
export default App;
