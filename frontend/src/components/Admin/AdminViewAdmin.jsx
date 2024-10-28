import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const AdminViewAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/admin/view/admins");
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
              {admins && admins.length > 0 ? (
                admins.map((admin) => (
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-3 px-6 text-center text-gray-500"
                  >
                    No admins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* View Modal */}
      {isModalOpen && admin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-[600px] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Admin Details</h3>
              <button onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <div>
              <p>
                <strong>First Name:</strong> {admin.first_name}
              </p>
              <p>
                <strong>Last Name:</strong> {admin.last_name}
              </p>
              <p>
                <strong>Email:</strong> {admin.email}
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewAdmin;
