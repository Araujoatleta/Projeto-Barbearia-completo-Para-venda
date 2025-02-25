import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Star, Clock } from 'lucide-react';
import axios from 'axios';

const Home = () => {
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

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-cover bg-center" 
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 text-center max-w-3xl px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Experience <span className="text-accent">Luxury</span> Grooming
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Where style meets sophistication
          </p>
          <Link to="/appointments" className="btn-primary">
            Book Now
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary">
        <div className="container-luxury">
          <div className="grid-luxury">
            <div className="card-luxury text-center">
              <Scissors className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Expert Stylists</h3>
              <p className="text-gray-400">
                Our master barbers bring years of experience and artistry to every cut
              </p>
            </div>
            <div className="card-luxury text-center">
              <Star className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Premium Service</h3>
              <p className="text-gray-400">
                Enjoy complimentary beverages and a relaxing atmosphere
              </p>
            </div>
            <div className="card-luxury text-center">
              <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
              <p className="text-gray-400">
                Book your appointment online anytime, anywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-primary">
        <div className="container-luxury">
          <h2 className="heading-luxury">
            Our <span className="text-accent">Services</span>
          </h2>
          <div className="grid-luxury">
            {error ? (
              <div className="col-span-3 bg-red-900/20 border-2 border-red-500/50 text-red-200 p-4 rounded-md">
                {error}
              </div>
            ) : services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className="card-luxury overflow-hidden">
                  <img
                    src={service.image_url || "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"}
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-gray-400 mb-4">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-accent font-bold">${service.price}</span>
                    <Link to="/appointments" className="btn-secondary">
                      Book Now
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-400">
                Loading services...
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;