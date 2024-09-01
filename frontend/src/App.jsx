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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/dashc" element={<DashboardCompany />} />
        <Route path="admin/dashboard" element={<Dashboard />} />
        <Route path="/privacypolicy" element={<PrivacyPol />} />
        <Route path="/contactpage" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/joblist" element={<JobListingPage />} />
        <Route path="/profile" element={<Profile />} />{" "}
        <Route
          path="/admin/dashboard/VerifyUsers"
          element={<AdminVerUsers />}
        />
        <Route
          path="/admin/dashboard/VerifyComps"
          element={<AdminVerComps />}
        />
        <Route
          path="/admin/dashboard/ViewUsers"
          element={<AdminViewUserss />}
        />
        <Route
          path="/admin/dashboard/ViewCompany"
          element={<AdminViewCompss />}
        />
        <Route path="/admin/dashboard/ViewJobs" element={<AdminViewJobss />} />
        <Route
          path="/admin/dashboard/DeleteUser"
          element={<AdminDelUserss />}
        />
        <Route path="/admin/dashboard/DeleteJob" element={<AdminDelJobss />} />
        <Route
          path="/admin/dashboard/DeleteCompany"
          element={<AdminDelCompss />}
        />
        {/* Unified profile route */}
        <Route path="/apply" element={<ApplyPg />} />
        <Route path="/dashboard/ViewJobs" element={<ViewJobsPage />} />
        <Route path="/faqs" element={<Faq />} />
        <Route path="/adminlogin" element={<AdminLog />} />
        <Route path="/dashboard/postjob" element={<PostJobPage />} />
        {/* <Route path="" */}
        <Route path="/company/viewapplicants" element={<CompanyViewAppl />} />
        <Route path="/forgotpassword" element={<ForgotP />} />
      </Routes>
    </Router>
  );
}

export default App;
