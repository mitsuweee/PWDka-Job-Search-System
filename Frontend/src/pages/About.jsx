import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AboutUs from '../components/Info/AboutContent'

const About = () => {
  return (
    <div className="bg-[#E3EDF7] ">
      <header>
        <Navbar />
      </header>
        <AboutUs/>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default About
