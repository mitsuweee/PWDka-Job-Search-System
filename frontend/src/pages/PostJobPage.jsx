import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PostJob from '../components/Dashboard/PostJobs'

const PostJobPage = () => {
  return (
    <div>
      <div className="bg-[#E3EDF7] min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
        <PostJob/>
      <footer>
        <Footer />
      </footer>
    </div>
    </div>
  )
}

export default PostJobPage
