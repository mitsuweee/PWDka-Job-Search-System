import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ViewApplicants from '../components/Dashboard/ViewApplicants'

const CompanyViewAppl = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
        <ViewApplicants/>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default CompanyViewAppl
