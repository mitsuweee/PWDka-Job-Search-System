import React from 'react'
import CompanyLoginComp from '../components/Main/CompLogin'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const CompanyLogin = () => {
  return (
    <div>
      <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
        <CompanyLoginComp/>
      <footer>
        <Footer />
      </footer>
    </div>
    </div>
  )
}

export default CompanyLogin
