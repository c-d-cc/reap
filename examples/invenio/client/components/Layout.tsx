import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          active
            ? "bg-indigo-700 text-white"
            : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <span className="text-white text-lg font-bold">Invenio</span>
              {navLink("/dashboard", "Dashboard")}
              {navLink("/items", "Items")}
              {navLink("/units", "Units")}
              {navLink("/categories", "Categories")}
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-indigo-100 text-sm">{user.name}</span>
              )}
              <button
                onClick={handleLogout}
                className="text-indigo-100 hover:text-white text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
