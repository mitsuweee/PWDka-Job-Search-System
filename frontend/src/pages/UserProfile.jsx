import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import UserProf from '../components/Profile/UserPContent'

const UserProfile = () => {
  return (
    <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
        <UserProf/>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default UserProfile
