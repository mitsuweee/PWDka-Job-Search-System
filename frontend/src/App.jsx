import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import DashboardCompany from "./pages/DashboardC.jsx";
import Dashboard from "./pages/DashboardAdmin.jsx";
import PrivacyPol from "./pages/PrivacyPol.jsx";
import Contact from "./pages/Contact.jsx";
import About from "./pages/About.jsx";
import SignUp from "./pages/SignUp.jsx";
import JobListingPage from "./pages/JobListPage.jsx";
import Profile from "./components/Profile/Profile.jsx"; // Corrected import path
import ApplyPg from "./pages/ApplyPg.jsx";
import Faq from "./pages/Faq.jsx";
import AdminLog from "./pages/AdminLogin.jsx";
import PostJobPage from "./pages/PostJobPage.jsx";
import ViewJobsPage from "./pages/ViewJobsPage.jsx";
import AdminVerUsers from "./pages/AdminVerUser.jsx";
import AdminVerComps from "./pages/AdminVerComp.jsx";
import AdminViewUserss from "./pages/AdminViewUserss.jsx";
import AdminViewCompss from "./pages/AdminViewCompss.jsx";
import AdminViewJobss from "./pages/AdminViewJobss.jsx";
import AdminDelUserss from "./pages/AdminDelUserss.jsx";
import AdminDelJobss from "./pages/AdminDelJobss.jsx";
import AdminDelCompss from "./pages/AdminDelCompss.jsx";
import CompanyViewAppl from "./pages/CompanyViewAppl.jsx";
import ForgotP from "./pages/ForgotP.jsx";
import ConfirmP from "./pages/ConfirmP.jsx";
import ProtectedRoute from "./protectedroute.js";
import RedirectAuthenticated from "./redirectauthenticated.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/privacypolicy" element={<PrivacyPol />} />
        <Route path="/contactpage" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/faqs" element={<Faq />} />
        <Route path="/forgotpassword" element={<ForgotP />} />
        <Route path="/passwordconfirmed" element={<ConfirmP />} />

        {/* RedirectAuthenticated Routes */}

        <Route
          path="/signup"
          element={
            <RedirectAuthenticated>
              <SignUp />
            </RedirectAuthenticated>
          }
        />

        <Route
          path="/login"
          element={
            <RedirectAuthenticated>
              <Login />
            </RedirectAuthenticated>
          }
        />
        {/* <Route
          path="/adminlogin"
          element={
            <RedirectAuthenticated>
              <AdminLog />
            </RedirectAuthenticated>
          }
        /> */}

        {/* Protected Routes */}
        <Route
          path="/apply"
          element={
            <ProtectedRoute role="user">
              <ApplyPg />
            </ProtectedRoute>
          }
        />
        <Route
          path="/joblist"
          element={
            <ProtectedRoute role="user">
              <JobListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashc"
          element={
            <ProtectedRoute role="company">
              <DashboardCompany />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/VerifyUsers"
          element={
            <ProtectedRoute role="admin">
              <AdminVerUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/VerifyComps"
          element={
            <ProtectedRoute role="admin">
              <AdminVerComps />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/ViewUsers"
          element={
            <ProtectedRoute role="admin">
              <AdminViewUserss />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/ViewCompany"
          element={
            <ProtectedRoute role="admin">
              <AdminViewCompss />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/ViewJobs"
          element={
            <ProtectedRoute role="admin">
              <AdminViewJobss />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/DeleteUser"
          element={
            <ProtectedRoute role="admin">
              <AdminDelUserss />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/DeleteJob"
          element={
            <ProtectedRoute role="admin">
              <AdminDelJobss />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/DeleteCompany"
          element={
            <ProtectedRoute role="admin">
              <AdminDelCompss />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ViewJobs"
          element={
            <ProtectedRoute role="company">
              <ViewJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/postjob"
          element={
            <ProtectedRoute role="company">
              <PostJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/viewapplicants"
          element={
            <ProtectedRoute role="company">
              <CompanyViewAppl />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
