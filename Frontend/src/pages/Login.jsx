import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LoginComp from '../components/Main/LoginContent'

const Login = () => {
  return (
    <div>
      <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
        <LoginComp/>
      <footer>
        <Footer />
      </footer>
    </div>
    </div>
  )
}

export default Login
