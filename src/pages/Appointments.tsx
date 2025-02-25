import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';
import axios from 'axios';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
    fetchBarbers();
    fetchAppointments();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
    }
  };

  const fetchBarbers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/barbers');
      setBarbers(response.data);
    } catch (error) {
      console.error('Error fetching barbers:', error);
      setError('Failed to load barbers');
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleBooking = async () => {
    try {
      await axios.post('http://localhost:3000/api/appointments', {
        service_id: selectedService,
        barber_id: selectedBarber,
        appointment_date: selectedDate,
        time: selectedTime
      });
      
      // Refresh appointments after booking
      fetchAppointments();
      
      // Reset form
      setSelectedService('');
      setSelectedBarber('');
      setSelectedTime('');
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment');
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-900/20 border-2 border-red-500/50 text-red-200 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">
        Book Your <span className="text-[#c4a47c]">Appointment</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-luxury">
          <h2 className="text-2xl font-bold mb-6">Select Service & Barber</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="input-luxury w-full"
            >
              <option value="">Choose a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} (${service.price})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Barber</label>
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              className="input-luxury w-full"
            >
              <option value="">Choose a barber</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Time</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="input-luxury w-full"
            >
              <option value="">Choose a time</option>
              <option value="9:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
            </select>
          </div>

          <button
            onClick={handleBooking}
            className="btn-primary w-full"
            disabled={!selectedService || !selectedBarber || !selectedTime}
          >
            Book Appointment
          </button>
        </div>

        <div className="card-luxury">
          <h2 className="text-2xl font-bold mb-6">Your Appointments</h2>
          
          {appointments.map((appointment) => (
            <div key={appointment.id} className="mb-4 p-4 bg-[#1c1c1c] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{appointment.service_name}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  appointment.status === 'confirmed' ? 'bg-green-900 text-green-200' :
                  appointment.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-red-900 text-red-200'
                }`}>
                  {appointment.status}
                </span>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(appointment.appointment_date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(appointment.appointment_date), 'h:mm a')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{appointment.barber_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Appointments;