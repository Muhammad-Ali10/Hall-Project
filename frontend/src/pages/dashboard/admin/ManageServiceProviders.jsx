import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiSearch, FiEye, FiCheck, FiX, FiLock, FiUnlock } from 'react-icons/fi';

const ManageServiceProviders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadServiceProviders();
  }, [status, page]);

  const loadServiceProviders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(status !== 'all' && { status }),
      });
      const response = await api.get(`/admin/service-providers?${queryParams}`);
      setServiceProviders(Array.isArray(response.data?.data) ? response.data.data : []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load service providers');
      setServiceProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (serviceProviderId, action) => {
    try {
      await api.put(`/admin/service-providers/${serviceProviderId}/approval`, { action });
      toast.success(`Service provider ${action}d successfully`);
      loadServiceProviders();
    } catch (error) {
      toast.error(`Failed to ${action} service provider`);
    }
  };

  const filteredProviders = serviceProviders.filter((sp) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      sp.businessName?.toLowerCase().includes(searchLower) ||
      sp.category?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Service Providers</h1>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search service providers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : !Array.isArray(filteredProviders) || filteredProviders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No service providers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProviders.map((sp) => (
                  <tr key={sp._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{sp.businessName}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{sp.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          sp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{sp.city || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/dashboard/admin/service-providers/${sp._id}/review`)}
                          className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded"
                        >
                          <FiEye size={18} />
                        </button>
                        {!sp.isActive && (
                          <button
                            onClick={() => handleApproval(sp._id, 'approve')}
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                          >
                            <FiCheck size={18} />
                          </button>
                        )}
                        {sp.isActive ? (
                          <button
                            onClick={() => handleApproval(sp._id, 'block')}
                            className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded"
                          >
                            <FiLock size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproval(sp._id, 'unblock')}
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                          >
                            <FiUnlock size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServiceProviders;

