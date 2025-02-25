import { useState, useEffect } from 'react';
import { User, Star, Gift, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loyaltyData, setLoyaltyData] = useState({
    points: 0,
    currentLevel: 'bronze',
    nextLevel: null,
    progress: 0,
    pointsToNextLevel: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/loyalty/points');
      setLoyaltyData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="card-luxury">
              <div className="flex flex-col items-center p-6">
                <div className="w-24 h-24 bg-[#3c3c3c] rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-[#c4a47c]" />
                </div>
                <h2 className="text-xl font-bold mb-2">{user?.name}</h2>
                <p className="text-[#c4a47c] mb-4">{loyaltyData.currentLevel} Member</p>
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Loyalty Points</span>
                    <span className="font-bold">{loyaltyData.points}</span>
                  </div>
                  <div className="w-full bg-[#3c3c3c] rounded-full h-2">
                    <div 
                      className="bg-[#c4a47c] h-2 rounded-full" 
                      style={{ width: `${loyaltyData.progress}%` }}
                    ></div>
                  </div>
                  {loyaltyData.nextLevel && (
                    <p className="text-xs text-gray-400 mt-1">
                      {loyaltyData.pointsToNextLevel} points until {loyaltyData.nextLevel}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-[#3c3c3c]">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full p-4 flex items-center justify-between ${activeTab === 'profile' ? 'text-[#c4a47c]' : 'text-gray-400'}`}
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`w-full p-4 flex items-center justify-between ${activeTab === 'rewards' ? 'text-[#c4a47c]' : 'text-gray-400'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Gift className="h-5 w-5" />
                    <span>Rewards</span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full p-4 flex items-center justify-between ${activeTab === 'history' ? 'text-[#c4a47c]' : 'text-gray-400'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5" />
                    <span>History</span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            {activeTab === 'profile' && (
              <div className="card-luxury">
                <h3 className="text-2xl font-bold mb-6">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name || ''}
                      className="input-luxury w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="input-luxury w-full"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue={user?.phone || ''}
                      className="input-luxury w-full"
                      placeholder="Add your phone number"
                    />
                  </div>
                  <button className="btn-primary w-full mt-6">
                    Update Profile
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div className="card-luxury">
                  <h3 className="text-2xl font-bold mb-6">Available Rewards</h3>
                  <div className="space-y-4">
                    {rewards.map((reward) => (
                      <div key={reward.id} className="flex items-center justify-between p-4 bg-[#1c1c1c] rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Gift className="h-8 w-8 text-[#c4a47c]" />
                          <div>
                            <h4 className="font-bold">{reward.name}</h4>
                            <p className="text-sm text-gray-400">{reward.points} points required</p>
                          </div>
                        </div>
                        <button
                          className={`btn-secondary ${reward.points > loyaltyData.points ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={reward.points > loyaltyData.points}
                        >
                          Redeem
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="card-luxury">
                <h3 className="text-2xl font-bold mb-6">Points History</h3>
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="p-4 bg-[#1c1c1c] rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold">{item.service}</h4>
                          <p className="text-sm text-gray-400">{item.date}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={item.points > 0 ? 'text-green-400' : 'text-red-400'}>
                            {item.points > 0 ? '+' : ''}{item.points} points
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">Barber: {item.barber}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const rewards = [
  { id: 1, name: "Free Executive Cut", points: 1000 },
  { id: 2, name: "Luxury Shave Package", points: 1500 },
  { id: 3, name: "VIP Treatment", points: 2000 }
];

const history = [
  { 
    id: 1, 
    service: "Executive Cut", 
    date: "March 1, 2024", 
    barber: "John Smith", 
    points: 45 
  },
  { 
    id: 2, 
    service: "Beard Sculpting", 
    date: "February 15, 2024", 
    barber: "Michael Johnson", 
    points: 30 
  }
];

export default Profile;