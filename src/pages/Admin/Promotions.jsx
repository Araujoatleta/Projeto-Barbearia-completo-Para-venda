import React, { useState, useEffect } from 'react';
import { Gift, Calendar, Percent, Plus, Edit, Trash } from 'lucide-react';
import axios from 'axios';

const Promotions = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    min_loyalty_level: null
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/promotions');
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPromotion) {
        await axios.put(`http://localhost:3000/api/promotions/${editingPromotion.id}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/promotions', formData);
      }
      setShowAddModal(false);
      setEditingPromotion(null);
      setFormData({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        start_date: '',
        end_date: '',
        min_loyalty_level: null
      });
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      start_date: promotion.start_date,
      end_date: promotion.end_date,
      min_loyalty_level: promotion.min_loyalty_level
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await axios.delete(`http://localhost:3000/api/promotions/${id}`);
        fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">
          Manage <span className="text-[#c4a47c]">Promotions</span>
        </h1>
        <button
          onClick={() => {
            setEditingPromotion(null);
            setFormData({
              name: '',
              description: '',
              discount_type: 'percentage',
              discount_value: '',
              start_date: '',
              end_date: '',
              min_loyalty_level: null
            });
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Promotion</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {promotions.map((promotion) => (
          <div key={promotion.id} className="card-luxury">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-[#c4a47c] rounded-lg">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{promotion.name}</h3>
                <p className="text-[#c4a47c]">{promotion.discount_type}</p>
              </div>
            </div>

            <p className="text-gray-400 mb-6">{promotion.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Percent className="h-5 w-5 text-[#c4a47c]" />
                  <span>Discount</span>
                </div>
                <span>{promotion.discount_value}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-[#c4a47c]" />
                  <span>Valid Until</span>
                </div>
                <span>{new Date(promotion.end_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleEdit(promotion)}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(promotion.id)}
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
              {editingPromotion ? 'Edit Promotion' : 'Add New Promotion'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Promotion Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-luxury w-full"
                  placeholder="Enter promotion name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-luxury w-full h-24 resize-none"
                  placeholder="Enter promotion description"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="input-luxury w-full"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Value</label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="input-luxury w-full"
                    placeholder="Enter value"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input-luxury w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="input-luxury w-full"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Loyalty Level</label>
                <select
                  value={formData.min_loyalty_level || ''}
                  onChange={(e) => setFormData({ ...formData, min_loyalty_level: e.target.value || null })}
                  className="input-luxury w-full"
                >
                  <option value="">No minimum level</option>
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPromotion(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingPromotion ? 'Update' : 'Add'} Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;