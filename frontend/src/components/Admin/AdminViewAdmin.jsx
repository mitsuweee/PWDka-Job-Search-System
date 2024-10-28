import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const AdminViewAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/view/admins");
        setAdmins(response.data.data);
        toast.success("Admins loaded successfully");
      } catch (error) {
        toast.error("Failed to load admins");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);
  const handleViewAdmin = (adminId) => {
    const selectedAdmin = admins.find((admin) => admin.id === adminId);
    setAdmin(selectedAdmin);
    setIsModalOpen(true);
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      await axios.delete(`/delete/admin/${adminId}`);
      setAdmins(admins.filter((admin) => admin.id !== adminId));
      toast.success("Admin deleted successfully");
    } catch (error) {
      toast.error("Failed to delete admin");
      console.error(error);
    }
  };

  // const handleUpdateAdmin = async (adminId, updatedAdmin) => {
  //   try {
  //     await axios.put(`/admin/update/details/${adminId}`, updatedAdmin);
  //     setAdmins(
  //       admins.map((admin) => (admin.id === adminId ? updatedAdmin : admin))
  //     );
  //     toast.success("Admin updated successfully");
  //     setIsModalOpen(false);
  //   } catch (error) {
  //     toast.error("Failed to update admin");
  //     console.error(error);
  //   }
  // };

  const handleChangePassword = async (adminId, newPasswordData) => {
    try {
      await axios.put(`/admin/update-password/${adminId}`, newPasswordData);
      toast.success("Password updated successfully");
      setIsPasswordModalOpen(false);
    } catch (error) {
      toast.error("Failed to update password");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-100">
      <Toaster position="top-center" reverseOrder={false} />
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
        </div>
      )}
      <main className="flex-grow p-8">
        <h1 className="text-xl font-bold text-gray-700">View All Admins</h1>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="bg-blue-600 text-white text-left">
                <th className="py-3 px-6">First Name</th>
                <th className="py-3 px-6">Last Name</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-6">{admin.first_name}</td>
                  <td className="py-3 px-6">{admin.last_name}</td>
                  <td className="py-3 px-6">{admin.email}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleViewAdmin(admin.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-700 transition duration-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md ml-2 hover:bg-green-700 transition duration-200"
                    >
                      Change Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* View/Edit Modal */}
      {isModalOpen && admin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-[600px] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Admin Details</h3>
              <button onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateAdmin(admin.id, admin);
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">First Name</label>
                <input
                  type="text"
                  value={admin.first_name}
                  onChange={(e) =>
                    setAdmin({ ...admin, first_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={admin.last_name}
                  onChange={(e) =>
                    setAdmin({ ...admin, last_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={admin.email}
                  onChange={(e) =>
                    setAdmin({ ...admin, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Change Password
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleChangePassword(admin.id, {
                  password: e.target.password.value,
                  new_password: e.target.new_password.value,
                  confirm_password: e.target.confirm_password.value,
                });
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Current Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewAdmin;
