import React, { useState, useEffect } from 'react';
import { User, Star, Calendar, Clock, Plus, Edit, Trash } from 'lucide-react';
import axios from 'axios';

const Barbers = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    specialties: '',
    years_experience: '',
    phone: '',
    is_available: true
  });

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/barbers');
      setBarbers(response.data);
    } catch (error) {
      console.error('Error fetching barbers:', error);
      setError('Failed to fetch barbers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingBarber) {
        await axios.put(`http://localhost:3000/api/barbers/${editingBarber.id}`, {
          bio: formData.bio,
          specialties: formData.specialties,
          years_experience: parseInt(formData.years_experience) || 0,
          is_available: formData.is_available,
          name: formData.name,
          phone: formData.phone
        });
      } else {
        await axios.post('http://localhost:3000/api/barbers', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          specialties: formData.specialties,
          years_experience: parseInt(formData.years_experience) || 0,
          phone: formData.phone
        });
      }

      setShowAddModal(false);
      setEditingBarber(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        bio: '',
        specialties: '',
        years_experience: '',
        phone: '',
        is_available: true
      });
      fetchBarbers();
    } catch (error) {
      console.error('Error saving barber:', error);
      setError(error.response?.data?.message || 'Failed to save barber');
    }
  };

  const handleEdit = (barber) => {
    setEditingBarber(barber);
    setFormData({
      name: barber.name,
      email: barber.email,
      bio: barber.bio || '',
      specialties: barber.specialties || '',
      years_experience: barber.years_experience || '',
      phone: barber.phone || '',
      is_available: barber.is_available
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this barber?')) {
      try {
        await axios.delete(`http://localhost:3000/api/barbers/${id}`);
        fetchBarbers();
      } catch (error) {
        console.error('Error deleting barber:', error);
        setError('Failed to delete barber');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">
          Manage <span className="text-[#c4a47c]">Barbers</span>
        </h1>
        <button
          onClick={() => {
            setEditingBarber(null);
            setFormData({
              name: '',
              email: '',
              password: '',
              bio: '',
              specialties: '',
              years_experience: '',
              phone: '',
              is_available: true
            });
            setError('');
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Barber</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border-2 border-red-500/50 text-red-200 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {barbers.map((barber) => (
          <div key={barber.id} className="card-luxury">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-[#3c3c3c] rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-[#c4a47c]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{barber.name}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-[#c4a47c] fill-current" />
                  <span>{barber.rating || '0.0'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-[#c4a47c]" />
                  <span>Experience</span>
                </div>
                <span>{barber.years_experience || 0} years</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-[#c4a47c]" />
                  <span>Status</span>
                </div>
                <span className={barber.is_available ? 'text-green-500' : 'text-red-500'}>
                  {barber.is_available ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>

            <div className="border-t border-[#3c3c3c] pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Specialties:</p>
                <div className="flex flex-wrap gap-2">
                  {barber.specialties?.split(',').map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-[#1c1c1c] rounded-full text-xs"
                    >
                      {specialty.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => handleEdit(barber)}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(barber.id)}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-900"
              >
                <Trash className="h-4 w-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card-luxury w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">
              {editingBarber ? 'Edit Barber' : 'Add New Barber'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-luxury w-full"
                  placeholder="Enter barber's name"
                  required
                />
              </div>
              {!editingBarber && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-luxury w-full"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-luxury w-full"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-luxury w-full"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="input-luxury w-full h-24 resize-none"
                  placeholder="Enter barber's bio"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Specialties</label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  className="input-luxury w-full"
                  placeholder="Enter specialties (comma separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                  className="input-luxury w-full"
                  placeholder="Enter years of experience"
                  min="0"
                />
              </div>
              {editingBarber && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label className="text-sm font-medium">Available for bookings</label>
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBarber(null);
                    setError('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingBarber ? 'Update' : 'Add'} Barber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Barbers;