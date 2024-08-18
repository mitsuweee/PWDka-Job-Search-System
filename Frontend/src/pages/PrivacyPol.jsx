import React from 'react'
import PrivacyPolicy from '../components/Info/PrivacyContent'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'


const PrivacyPol = () => {
  return (
    <div>
      <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
        <PrivacyPolicy/>
      <footer>
        <Footer />
      </footer>
    </div>
    </div>
  )
}

export default PrivacyPol
