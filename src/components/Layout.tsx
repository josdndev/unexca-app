import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShieldCheck, 
  LogOut, 
  Bell,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LayoutProps {
  user: UserProfile;
}

export default function Layout({ user }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { name: 'Panel Control', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    ...(user.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: ShieldCheck }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-blue-700">
            <div className="h-8 w-8 rounded bg-blue-700 text-white flex items-center justify-center">U</div>
            <span className="text-xl tracking-tight">UNEXCA Central</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Ver Sitio Público
          </Link>
          <div className="my-4 border-t border-slate-100" />
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-blue-700"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8 border border-slate-200">
              <AvatarFallback className="bg-blue-700 text-white text-xs">{user.email[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-900">{user.name || 'Profesor'}</p>
              <p className="truncate text-[10px] uppercase tracking-wider text-slate-400 font-bold">{user.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header - Mobile & Desktop */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-4 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <span className="font-bold text-blue-700">UNEXCA</span>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              {navItems.find(i => i.path === location.pathname)?.name || 'Panel'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-blue-700">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-700"></span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-blue-700">UNEXCA Central</span>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="space-y-2">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-500 hover:bg-slate-50"
                >
                  <Home className="h-5 w-5" />
                  Inicio Público
                </Link>
                <div className="my-4 border-t border-slate-100" />
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                      location.pathname === item.path
                        ? "bg-blue-700 text-white shadow-lg shadow-blue-700/20"
                        : "text-slate-500 hover:bg-slate-50 hover:text-blue-700"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="absolute bottom-8 left-6 right-6">
                <Button variant="outline" className="w-full justify-start gap-3 border-slate-200 text-slate-500" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  Cerrar Sesión
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
