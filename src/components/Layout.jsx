import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Toaster, toast } from 'react-hot-toast';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Toaster position="top-right" />

      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">FocusFlow</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
