import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, FileText, Shield, LogOut, Edit } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useBooking();

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    showToast('Logged out successfully', 'success');
  };

  const handleComingSoon = (feature) => {
    showToast(`${feature} coming soon!`, 'info');
  };

  const menuItems = [
    {
      icon: Edit,
      label: 'Edit Profile',
      description: 'Update your personal information',
      onClick: () => handleComingSoon('Edit Profile'),
    },
    {
      icon: Calendar,
      label: 'Booking History',
      description: 'View all your past and upcoming bookings',
      onClick: () => navigate('/my-bookings'),
    },
    {
      icon: FileText,
      label: 'Terms & Conditions',
      description: 'Read our terms and conditions',
      onClick: () => handleComingSoon('Terms & Conditions'),
    },
    {
      icon: Shield,
      label: 'Privacy Policy',
      description: 'View our privacy policy',
      onClick: () => handleComingSoon('Privacy Policy'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="header-gradient text-white shadow-lg">
        <div className="container mx-auto px-4 py-5">
          <h1 className="text-2xl font-extrabold">Profile</h1>
          <p className="text-white/70 text-xs mt-0.5">Manage your account</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* User Info Card */}
        <div className="card mb-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-3xl font-bold">
                {getInitials(user.name)}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
            <p className="text-sm text-gray-500">Member since Jan 2026</p>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{user.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-3 mb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="card w-full text-left hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 group-hover:bg-green-100 rounded-lg transition-colors">
                    <Icon size={24} className="text-gray-600 group-hover:text-green-600 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{item.label}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100 font-semibold rounded-lg transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>

        {/* App Version */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Turf Booking v1.0.0 - Demo Mode
        </p>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Profile;
