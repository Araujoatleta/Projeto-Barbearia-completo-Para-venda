import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import axios from 'axios';

const Services = () => {
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
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
        Our Premium <span className="text-[#c4a47c]">Services</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service.id} className="card-luxury">
            <div className="relative">
              <img
                src={service.image_url || "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"}
                alt={service.name}
                className="w-full h-48 object-cover rounded-t-md"
              />
              <div className="absolute top-4 right-4 bg-[#c4a47c] text-white px-3 py-1 rounded-full">
                ${service.price}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{service.name}</h3>
              <p className="text-gray-400 mb-4">{service.description}</p>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-[#c4a47c]" />
                  <span>{service.duration} min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-[#c4a47c]" />
                  <span>{service.points_earned} points</span>
                </div>
              </div>
              <Link to="/appointments" className="btn-primary w-full text-center">
                Book Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;