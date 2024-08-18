import React from 'react'
import CompanyProf from '../components/Profile/CompanyPContent'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const CompanyProfile = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
        <CompanyProf/>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default CompanyProfile
