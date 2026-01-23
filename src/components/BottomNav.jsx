import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/my-bookings', icon: Calendar, label: 'My Bookings' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-green-500'
                }`}
            >
              <Icon size={24} className={isActive ? 'stroke-2' : 'stroke-1'} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-normal'
                }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
