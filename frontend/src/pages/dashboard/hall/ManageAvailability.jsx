import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiX, FiCheck } from 'react-icons/fi';

const ManageAvailability = () => {
  const [availability, setAvailability] = useState({
    bookedDates: [],
    blockedDates: [],
    availableDates: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState([]);
  const [blockReason, setBlockReason] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const response = await api.get('/halls/my/hall/availability');
      if (response.data && response.data.success) {
        setAvailability({
          bookedDates: response.data.data.bookedDates || [],
          blockedDates: response.data.data.blockedDates || [],
          availableDates: response.data.data.availableDates || [],
        });
      }
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast.error('Failed to load availability');
      setAvailability({
        bookedDates: [],
        blockedDates: [],
        availableDates: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDates((prev) => {
      if (prev.includes(dateStr)) {
        return prev.filter((d) => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  const handleBlockDates = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select dates to block');
      return;
    }

    try {
      const response = await api.post('/halls/my/hall/availability', {
        action: 'block',
        dates: selectedDates,
        reason: blockReason || 'Blocked by owner',
      });
      if (response.data && response.data.success) {
        toast.success('Dates blocked successfully');
        setSelectedDates([]);
        setBlockReason('');
        await loadAvailability();
      } else {
        toast.error('Failed to block dates');
      }
    } catch (error) {
      console.error('Failed to block dates:', error);
      toast.error(error.response?.data?.message || 'Failed to block dates');
    }
  };

  const handleUnblockDates = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select dates to unblock');
      return;
    }

    try {
      await api.post('/halls/my/hall/availability', {
        action: 'unblock',
        dates: selectedDates,
      });
      toast.success('Dates unblocked successfully');
      setSelectedDates([]);
      await loadAvailability();
    } catch (error) {
      console.error('Failed to unblock dates:', error);
      toast.error(error.response?.data?.message || 'Failed to unblock dates');
    }
  };

  const handleMarkAsBooked = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select dates to mark as booked');
      return;
    }

    try {
      const response = await api.post('/halls/my/hall/availability', {
        action: 'mark-booked',
        dates: selectedDates,
      });
      if (response.data && response.data.success) {
        toast.success('Dates marked as booked successfully');
        setSelectedDates([]);
        await loadAvailability();
      } else {
        toast.error('Failed to mark dates as booked');
      }
    } catch (error) {
      console.error('Failed to mark dates as booked:', error);
      toast.error(error.response?.data?.message || 'Failed to mark dates as booked');
    }
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }

    return days;
  };

  const getDateStatus = (date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const isBooked = (availability.bookedDates || []).some((bd) => {
      const bookedDate = new Date(bd.date);
      bookedDate.setHours(0, 0, 0, 0);
      return bookedDate.toISOString().split('T')[0] === dateStr;
    });
    
    const isBlocked = (availability.blockedDates || []).some((bd) => {
      const blockedDate = new Date(bd.date);
      blockedDate.setHours(0, 0, 0, 0);
      return blockedDate.toISOString().split('T')[0] === dateStr;
    });
    
    const isSelected = selectedDates.includes(dateStr);
    const isPast = checkDate < today;

    return { isBooked, isBlocked, isSelected, isPast };
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How to manage availability:</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
          <li>Click on dates to select them</li>
          <li>Green dates are available for booking</li>
          <li>Red dates are blocked/unavailable</li>
          <li>Orange dates are already booked</li>
          <li>Select dates and click "Block Dates" or "Unblock Dates"</li>
        </ul>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded"></div>
          <span className="text-sm text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 border-2 border-red-500 rounded"></div>
          <span className="text-sm text-gray-700">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-100 border-2 border-orange-500 rounded"></div>
          <span className="text-sm text-gray-700">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 border-2 border-blue-500 rounded"></div>
          <span className="text-sm text-gray-700">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded"></div>
          <span className="text-sm text-gray-700">Past Date</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition"
          >
            ← Previous
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition"
          >
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="h-12"></div>;
            }

            const status = getDateStatus(date);
            const dateStr = date.toISOString().split('T')[0];
            const day = date.getDate();

            return (
              <button
                key={dateStr}
                onClick={() => !status.isPast && handleDateClick(date)}
                disabled={status.isPast}
                className={`
                  h-12 rounded-lg font-semibold transition
                  ${status.isSelected
                    ? 'bg-blue-500 text-white border-2 border-blue-700'
                    : status.isBooked
                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-500 cursor-not-allowed'
                    : status.isBlocked
                    ? 'bg-red-100 text-red-800 border-2 border-red-500'
                    : status.isPast
                    ? 'bg-gray-100 text-gray-400 border-2 border-gray-300 cursor-not-allowed'
                    : 'bg-green-100 text-green-800 border-2 border-green-500 hover:bg-green-200'
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {selectedDates.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Block Reason (Optional)
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., Maintenance, Holiday, etc."
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleBlockDates}
                className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <FiX size={20} />
                Block Dates
              </button>
              <button
                onClick={handleUnblockDates}
                className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <FiCheck size={20} />
                Unblock Dates
              </button>
              <button
                onClick={handleMarkAsBooked}
                className="bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2"
              >
                <FiCalendar size={20} />
                Mark as Booked
              </button>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> 
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Block:</strong> Prevents new bookings for selected dates</li>
                  <li><strong>Unblock:</strong> Makes blocked dates available again</li>
                  <li><strong>Mark as Booked:</strong> Manually mark dates as booked (e.g., for offline bookings)</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Booked Dates List */}
      {availability.bookedDates.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Booked Dates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availability.bookedDates.map((bd, index) => (
              <div
                key={index}
                className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center"
              >
                <p className="text-sm font-semibold text-orange-800">
                  {new Date(bd.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAvailability;

