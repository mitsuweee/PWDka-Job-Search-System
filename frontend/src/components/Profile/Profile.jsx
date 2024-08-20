import React from 'react';
import UserProf from './UserPContent';
import CompanyProf from './CompanyPContent';

const Profile = () => {
  // Assume the user type is stored in localStorage
  const userType = sessionStorage.getItem('userRole'); // Could be 'user' or 'company'

  // Render the appropriate profile based on the user type
  if (userType === 'company') {
    return <CompanyProf />;
  } else if (userType === 'user') {
    return <UserProf />;
  } else {
    return <div>Error: Unknown user type</div>;
  }
};

export default Profile;
