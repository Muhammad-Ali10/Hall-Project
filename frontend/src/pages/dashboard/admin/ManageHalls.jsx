import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiCheck,
  FiX,
  FiLock,
  FiUnlock,
} from 'react-icons/fi';

const ManageHalls = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadHalls();
  }, [status, page]);

  const loadHalls = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(status !== 'all' && { status }),
      });
      const response = await api.get(`/admin/hall-owners?${queryParams}`);
      setHalls(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load halls');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, action) => {
    try {
      await api.put(`/admin/hall-owners/${userId}/approval`, { action });
      toast.success(`Hall ${action}d successfully`);
      loadHalls();
    } catch (error) {
      toast.error(`Failed to ${action} hall`);
    }
  };

  const handleBlock = async (hallId, action) => {
    try {
      await api.put(`/admin/halls/${hallId}/block`, { action });
      toast.success(`Hall ${action}ed successfully`);
      loadHalls();
    } catch (error) {
      toast.error(`Failed to ${action} hall`);
    }
  };

  const filteredHalls = halls.filter((owner) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      owner.hall?.name?.toLowerCase().includes(searchLower) ||
      owner.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Halls</h1>
        <div className="flex items-center space-x-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search halls by name or owner email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Halls List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredHalls.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No halls found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hall Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHalls.map((owner) => (
                  <tr key={owner._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{owner.hall?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{owner.email}</div>
                      <div className="text-sm text-gray-500">{owner.profile?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          owner.hallApprovalStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : owner.hallApprovalStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {owner.hallApprovalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {owner.hall?.address?.city || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/admin/halls/${owner.hall?._id}/review`)
                          }
                          className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>
                        {owner.hallApprovalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproval(owner._id, 'approve')}
                              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <FiCheck size={18} />
                            </button>
                            <button
                              onClick={() => handleApproval(owner._id, 'reject')}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <FiX size={18} />
                            </button>
                          </>
                        )}
                        {owner.hall?.isActive ? (
                          <button
                            onClick={() => handleBlock(owner.hall._id, 'block')}
                            className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded"
                            title="Block"
                          >
                            <FiLock size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(owner.hall._id, 'unblock')}
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                            title="Unblock"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageHalls;

