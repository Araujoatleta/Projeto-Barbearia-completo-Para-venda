import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/appointments');
      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
      setLoading(false);
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      setError('');
      setSuccess('');

      const response = await axios.post(`http://localhost:3000/api/loyalty/complete-appointment/${appointmentId}`);
      setSuccess(`Appointment completed! ${response.data.pointsAwarded} points awarded.${
        response.data.newLevel ? ` Client reached ${response.data.newLevel} level!` : ''
      }`);
      
      fetchAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
      setError('Failed to complete appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#c4a47c]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">
        Manage <span className="text-[#c4a47c]">Appointments</span>
      </h1>

      {error && (
        <div className="bg-red-900/20 border-2 border-red-500/50 text-red-200 p-4 rounded-md mb-6 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border-2 border-green-500/50 text-green-200 p-4 rounded-md mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="card-luxury">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{appointment.service_name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm ${
                appointment.status === 'completed' ? 'bg-green-900/20 text-green-200' :
                appointment.status === 'confirmed' ? 'bg-[#c4a47c]/20 text-[#c4a47c]' :
                'bg-red-900/20 text-red-200'
              }`}>
                {appointment.status}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-[#c4a47c]" />
                <span>{appointment.client_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-[#c4a47c]" />
                <span>{format(new Date(appointment.appointment_date), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-[#c4a47c]" />
                <span>{format(new Date(appointment.appointment_date), 'h:mm a')}</span>
              </div>
            </div>

            {appointment.status === 'confirmed' && (
              <div className="flex space-x-4">
                <button
                  onClick={() => handleComplete(appointment.id)}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Check className="h-5 w-5" />
                  <span>Complete</span>
                </button>
                <button
                  onClick={() => {/* Handle cancel */}}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-900"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAppointments;