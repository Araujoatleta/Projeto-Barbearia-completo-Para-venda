import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, DollarSign, TrendingUp, 
  Scissors, Package, Star, MessageSquare,
  Gift
} from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">
        Admin <span className="text-[#c4a47c]">Dashboard</span>
      </h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link to="/admin/appointments" className="card-luxury hover:border-[#c4a47c] transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#c4a47c] rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Manage</p>
              <p className="text-xl font-bold">Appointments</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/loyalty" className="card-luxury hover:border-[#c4a47c] transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#c4a47c] rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Manage</p>
              <p className="text-xl font-bold">Loyalty Points</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/promotions" className="card-luxury hover:border-[#c4a47c] transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#c4a47c] rounded-lg">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Manage</p>
              <p className="text-xl font-bold">Promotions</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/chat" className="card-luxury hover:border-[#c4a47c] transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#c4a47c] rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">View</p>
              <p className="text-xl font-bold">Messages</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="card-luxury">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#c4a47c] rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Clients</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
          </div>
        </div>

        <div className="card-luxury">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#c4a47c] rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Appointments Today</p>
              <p className="text-2xl font-bold">28</p>
            </div>
          </div>
        </div>

        <div className="card-luxury">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#c4a47c] rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Revenue Today</p>
              <p className="text-2xl font-bold">$1,890</p>
            </div>
          </div>
        </div>

        <div className="card-luxury">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#c4a47c] rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Growth</p>
              <p className="text-2xl font-bold">+12.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-luxury">
          <h2 className="text-2xl font-bold mb-6">Recent Appointments</h2>
          <div className="space-y-4">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-[#1c1c1c] rounded-lg">
                <div className="flex items-center space-x-4">
                  <Scissors className="h-5 w-5 text-[#c4a47c]" />
                  <div>
                    <p className="font-semibold">{appointment.client}</p>
                    <p className="text-sm text-gray-400">{appointment.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{appointment.time}</p>
                  <p className="text-sm text-gray-400">{appointment.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="card-luxury">
            <h2 className="text-2xl font-bold mb-6">Top Services</h2>
            <div className="space-y-4">
              {topServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-[#1c1c1c] rounded-lg">
                      <Scissors className="h-5 w-5 text-[#c4a47c]" />
                    </div>
                    <span>{service.name}</span>
                  </div>
                  <span className="font-semibold">{service.count} bookings</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-luxury">
            <h2 className="text-2xl font-bold mb-6">Recent Reviews</h2>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="p-4 bg-[#1c1c1c] rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold">{review.client}</p>
                    <div className="flex items-center space-x-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-[#c4a47c] fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const recentAppointments = [
  {
    id: 1,
    client: "John Doe",
    service: "Executive Cut",
    time: "10:00 AM",
    date: "Today"
  },
  {
    id: 2,
    client: "Mike Smith",
    service: "Luxury Shave",
    time: "11:30 AM",
    date: "Today"
  },
  {
    id: 3,
    client: "David Brown",
    service: "VIP Package",
    time: "2:00 PM",
    date: "Today"
  }
];

const topServices = [
  { id: 1, name: "Executive Cut", count: 145 },
  { id: 2, name: "Luxury Shave", count: 98 },
  { id: 3, name: "Beard Sculpting", count: 76 },
  { id: 4, name: "VIP Package", count: 54 }
];

const recentReviews = [
  {
    id: 1,
    client: "John Doe",
    rating: 5,
    comment: "Excellent service and attention to detail!"
  },
  {
    id: 2,
    client: "Mike Smith",
    rating: 4,
    comment: "Great experience, will definitely come back."
  }
];

export default Dashboard;