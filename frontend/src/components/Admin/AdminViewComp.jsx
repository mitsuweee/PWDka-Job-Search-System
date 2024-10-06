import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminViewComp = () => {
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState(null); // Store the specific company to view
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all companies
    const config = {
      method: "get",
      url: "http://localhost:8080/admin/view/companies", // Fetch companies from your API
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        const companyDataArray = response.data.data;
        setCompanies(companyDataArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  // Fetch and show company details in the modal
  const handleViewCompany = (companyId) => {
    const config = {
      method: "get",
      url: `http://localhost:8080/company/view/${companyId}`, // Fetch specific company by ID
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then((response) => {
        const companyData = response.data.data; // Assuming the company object is returned
        setCompany(formatCompanyData(companyData)); // Set the company details
        setIsModalOpen(true); // Open the modal
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Helper function to format company data
  const formatCompanyData = (companyData) => {
    return {
      id: companyData.id,
      companyName: companyData.name,
      address: companyData.address,
      city: companyData.city,
      description: companyData.description,
      contactNumber: companyData.contact_number,
      companyEmail: companyData.email,
      companyProfile: `data:image/png;base64,${companyData.profile_picture}`,
    };
  };

  // Handle delete company
  const handleDeleteCompany = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this company?"
    );
    if (confirmed) {
      const config = {
        method: "delete",
        url: `http://localhost:8080/admin/delete/company/${id}`, // Use appropriate API endpoint for deleting a company
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then((response) => {
          alert("Company deleted successfully!");
          // Remove the deleted company from the state to update the UI
          setCompanies((prevCompanies) =>
            prevCompanies.filter((company) => company.id !== id)
          );
        })
        .catch((error) => {
          console.error(error);
          alert("An error occurred while deleting the company.");
        });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setCompany(null); // Clear the company details
  };

  if (loading) {
    return <div>Loading companies...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-100">
      <main className="flex-grow p-8">
        <h1 className="text-xl font-bold text-gray-700">View All Companies</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white mt-4">
            <thead>
              <tr className="w-full bg-blue-500 text-white">
                <th className="py-2 px-4">Company Name</th>
                <th className="py-2 px-4">City</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b">
                  <td className="py-2 px-4">{company.name}</td>
                  <td className="py-2 px-4">{company.city}</td>
                  <td className="py-2 px-4 flex">
                    <button
                      onClick={() => handleViewCompany(company.id)} // Pass company ID when clicking "View"
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)} // Delete company when clicking "Delete"
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal for viewing company details */}
      {isModalOpen && company && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 md:max-w-3xl p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">
              Company Details
            </h2>

            <div className="flex justify-center mb-4 sm:mb-6">
              <img
                src={company.companyProfile}
                alt="Profile"
                className="w-40 h-40 rounded-full border-2 border-gray-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left text-gray-800 w-full">
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Company Name:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {company.companyName}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">City:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {company.city}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">Address:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {company.address}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Description:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {company.description}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  Contact Number:
                </p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {company.contactNumber}
                </p>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">Email:</p>
                <p className="text-lg sm:text-xl bg-gray-100 rounded-md p-2">
                  {company.companyEmail}
                </p>
              </div>
            </div>

            {/* Buttons for Back */}
            <div className="mt-6 text-center space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                onClick={closeModal} // Close modal
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewComp;
