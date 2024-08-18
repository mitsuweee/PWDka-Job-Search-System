import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FrequentlyAsk from '../components/Info/FaqContent'

const Faq = () => {
  return (
    <div className="bg-[#E3EDF7] ">
      <header>
        <Navbar />
      </header>
        <FrequentlyAsk/>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default Faq
