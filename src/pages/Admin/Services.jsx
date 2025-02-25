import React, { useState, useEffect } from 'react';
import { Scissors, Clock, Star, Plus, Edit, Trash } from 'lucide-react';
import axios from 'axios';

const Services = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: 'haircut',
    points_earned: '',
    image_url: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to fetch services');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingService) {
        await axios.put(`http://localhost:3000/api/services/${editingService.id}`, {
          ...formData,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
          points_earned: parseInt(formData.points_earned),
          is_active: true
        });
      } else {
        await axios.post('http://localhost:3000/api/services', {
          ...formData,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
          points_earned: parseInt(formData.points_earned),
          is_active: true
        });
      }

      setShowAddModal(false);
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        category: 'haircut',
        points_earned: '',
        image_url: ''
      });
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      setError(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration: service.duration.toString(),
      price: service.price.toString(),
      category: service.category,
      points_earned: service.points_earned.toString(),
      image_url: service.image_url || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`http://localhost:3000/api/services/${id}`);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        setError('Failed to delete service');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">
          Manage <span className="text-[#c4a47c]">Services</span>
        </h1>
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({
              name: '',
              description: '',
              duration: '',
              price: '',
              category: 'haircut',
              points_earned: '',
              image_url: ''
            });
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Service</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border-2 border-red-500/50 text-red-200 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service.id} className="card-luxury">
            <div className="relative mb-6">
              <img
                src={service.image_url || "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"}
                alt={service.name}
                className="w-full h-48 object-cover rounded-md"
              />
              <div className="absolute top-4 right-4 bg-[#c4a47c] text-white px-3 py-1 rounded-full">
                ${service.price}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">{service.name}</h3>
            <p className="text-gray-400 mb-6">{service.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-[#c4a47c]" />
                  <span>Duration</span>
                </div>
                <span>{service.duration} min</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-[#c4a47c]" />
                  <span>Points</span>
                </div>
                <span>{service.points_earned} points</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleEdit(service)}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-900"
              >
                <Trash className="h-4 w-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card-luxury w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Service Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-luxury w-full"
                  placeholder="Enter service name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-luxury w-full h-24 resize-none"
                  placeholder="Enter service description"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (min)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-luxury w-full"
                    placeholder="Enter duration"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-luxury w-full"
                    placeholder="Enter price"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-luxury w-full"
                  required
                >
                  <option value="haircut">Haircut</option>
                  <option value="beard">Beard</option>
                  <option value="combo">Combo</option>
                  <option value="special">Special</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Points Earned</label>
                <input
                  type="number"
                  value={formData.points_earned}
                  onChange={(e) => setFormData({ ...formData, points_earned: e.target.value })}
                  className="input-luxury w-full"
                  placeholder="Enter points"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input-luxury w-full"
                  placeholder="Enter image URL"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingService(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingService ? 'Update' : 'Add'} Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;