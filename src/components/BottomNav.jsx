import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User } from 'lucide-react';

const navItems = [
  { path: '/',            icon: Home,     label: 'Home' },
  { path: '/my-bookings', icon: Calendar, label: 'Bookings' },
  { path: '/profile',     icon: User,     label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="border-t border-gray-100 shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center justify-center flex-1 h-full transition-all group"
              >
                <div className={`p-1.5 rounded-xl transition-all duration-150 ${
                  isActive ? 'bg-emerald-100' : 'group-hover:bg-gray-100'
                }`}>
                  <Icon
                    size={22}
                    className={isActive
                      ? 'text-emerald-600 stroke-2'
                      : 'text-gray-400 stroke-[1.5] group-hover:text-gray-600'
                    }
                  />
                </div>
                <span className={`text-xs mt-0.5 transition-all ${
                  isActive ? 'font-bold text-emerald-600' : 'font-normal text-gray-400'
                }`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
