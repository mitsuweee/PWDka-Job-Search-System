import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MainContent from '../components/Main/MainContent'

const MainPage = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
      <main className="flex-1 flex justify-center items-center">
        <MainContent />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default MainPage
