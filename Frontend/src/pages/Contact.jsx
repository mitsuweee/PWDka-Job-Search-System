import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ContactUs from '../components/Info/ContactContent'

const Contact = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
        <ContactUs/>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default Contact
