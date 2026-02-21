import { FC } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { User, LogOut, CalendarDays } from 'lucide-react';

export const Layout: FC = () => {
  const { auth, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // 判断当前路由
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen bg-immortal-bg">
      {/* Header */}
      <header className="border-b border-immortal-secondary/20 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🦐</span>
            <h1 className="text-xl font-bold text-gradient">凡人修仙</h1>
          </Link>
          
          <div className="flex items-center gap-2">
            {/* 导航链接 */}
            <Link 
              to="/daily-summary" 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm
                ${isActive('/daily-summary') 
                  ? 'bg-immortal-primary/20 text-immortal-primary' 
                  : 'hover:bg-immortal-secondary/20 text-immortal-secondary'
                }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">每日总结</span>
            </Link>
            
            <Link 
              to="/profile" 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm
                ${isActive('/profile') 
                  ? 'bg-immortal-primary/20 text-immortal-primary' 
                  : 'hover:bg-immortal-secondary/20 text-immortal-secondary'
                }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{auth.user?.daoName}</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-immortal-secondary/20 transition-colors text-immortal-secondary"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
