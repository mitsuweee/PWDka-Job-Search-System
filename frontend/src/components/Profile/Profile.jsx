import React from 'react';
import UserProf from './UserPContent';
import CompanyProf from './CompanyPContent';

const Profile = () => {
  // Example: Assume userType is stored in localStorage
  const userType = localStorage.getItem('userType'); // Should be 'user' or 'company'

  if (userType === 'company') {
    return <CompanyProf />;
  } else if (userType === 'user') {
    return <UserProf />;
  } else {
    return <div>Error: Unknown user type</div>;
  }
};

export default Profile;
