import React from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import ApplyPage from '../components/ApplyContent'

const ApplyPg = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
        <ApplyPage/>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default ApplyPg
