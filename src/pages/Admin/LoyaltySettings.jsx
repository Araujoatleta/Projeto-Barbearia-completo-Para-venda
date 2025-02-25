import React, { useState, useEffect } from 'react';
import { Star, Save, AlertCircle } from 'lucide-react';
import axios from 'axios';

const LoyaltySettings = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/loyalty/points');
      setLevels(response.data.levels);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching loyalty levels:', error);
      setError('Failed to load loyalty levels');
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');

      // Validate points required are in ascending order
      for (let i = 1; i < levels.length; i++) {
        if (levels[i].points_required <= levels[i-1].points_required) {
          setError('Points required must be in ascending order');
          return;
        }
      }

      await axios.put('http://localhost:3000/api/loyalty/levels', { levels });
      setSuccess('Loyalty levels updated successfully');
    } catch (error) {
      console.error('Error updating loyalty levels:', error);
      setError('Failed to update loyalty levels');
    }
  };

  const handleChange = (index, field, value) => {
    const newLevels = [...levels];
    newLevels[index] = {
      ...newLevels[index],
      [field]: field === 'points_required' ? parseInt(value) || 0 : value
    };
    setLevels(newLevels);
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
        Loyalty <span className="text-[#c4a47c]">Settings</span>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {levels.map((level, index) => (
          <div key={level.level} className="card-luxury">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-[#c4a47c] rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold capitalize">{level.level}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Points Required</label>
                <input
                  type="number"
                  value={level.points_required}
                  onChange={(e) => handleChange(index, 'points_required', e.target.value)}
                  className="input-luxury w-full"
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={level.description}
                  onChange={(e) => handleChange(index, 'description', e.target.value)}
                  className="input-luxury w-full h-24 resize-none"
                  placeholder="Enter level description"
                ></textarea>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="btn-primary flex items-center space-x-2"
      >
        <Save className="h-5 w-5" />
        <span>Save Changes</span>
      </button>
    </div>
  );
};

export default LoyaltySettings;