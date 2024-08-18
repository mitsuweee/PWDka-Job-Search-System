import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login.jsx';
import LandingPage from './pages/LandingPage.jsx';
import MainPage from './pages/MainPage.jsx';
import DashboardCompany from './pages/DashboardC.jsx';
import Dashboard from './pages/DashboardAdmin.jsx';
import PrivacyPol from './pages/PrivacyPol.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';
import SignUp from './pages/SignUp.jsx';
import JobListingPage from './pages/JobListPage.jsx';
import UserProfile from './pages/UserProfile.jsx';
import CompanyProfile from './pages/CompanyProfile.jsx';
import ApplyPg from './pages/ApplyPg.jsx';
import Faq from './pages/Faq.jsx';



// lmao

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/dashc" element={<DashboardCompany />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/privacypolicy" element={<PrivacyPol />} />
        <Route path="/contactpage" element={<Contact />} />
        <Route path="/about" element={<About/>} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/joblist" element={<JobListingPage/>} />
        <Route path="/uprofile" element={<UserProfile/>} />
        <Route path="/cprofile" element={<CompanyProfile/>} />
        <Route path="/apply" element={<ApplyPg/>} />
        <Route path="/faqs" element={<Faq/>} />
        

      </Routes>
    </Router>
  );
}

export default App;
