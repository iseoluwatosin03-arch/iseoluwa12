import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-white shadow-t py-4 text-center text-gray-500">
        <p>&copy; 2025 SoloParentLove. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
