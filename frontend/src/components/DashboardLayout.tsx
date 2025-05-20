import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Menu,
  X,
  User,
  Users,
  ListTodo,
  CheckSquare,
  Plus,
  ClipboardList,
  Eye,
  Award,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    const userRole = user?.role?.toLowerCase();
    if (userRole === "admin") {
      return [
        {
          name: "Staff Rankings",
          path: "/admin",
          icon: <Award className="mr-2 h-5 w-5" />,
        },
        // {
        //   name: "View All Users",
        //   path: "/admin/users",
        //   icon: <Users className="mr-2 h-5 w-5" />,
        // },
      ];
    } else if (userRole === "hod") {
      return [
        {
          name: "Department Subtasks",
          path: "/hod",
          icon: <ListTodo className="mr-2 h-5 w-5" />,
        },
        {
          name: "Staff List",
          path: "/hod/staff",
          icon: <Users className="mr-2 h-5 w-5" />,
        },
        {
          name: "Create Task",
          path: "/hod/create-task",
          icon: <Plus className="mr-2 h-5 w-5" />,
        },
        {
          name: "Create User",
          path: "/hod/create-user",
          icon: <UserPlus className="mr-2 h-5 w-5" />,
        },
        {
          name: "Pending Reviews",
          path: "/hod/pending-reviews",
          icon: <CheckSquare className="mr-2 h-5 w-5" />,
        },
        {
          name: "View All Tasks",
          path: "/hod/all-tasks",
          icon: <ClipboardList className="mr-2 h-5 w-5" />,
        },
      ];
    } else if (userRole === "staff") {
      return [
        {
          name: "My Tasks",
          path: "/staff",
          icon: <ListTodo className="mr-2 h-5 w-5" />,
        },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden text-white"
              onClick={toggleSidebar}
              aria-label="Toggle Menu"
            >
              <Menu size={24} />
            </button>
            <motion.h1
              className="text-xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Staff Appraisal System
            </motion.h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-blue-700"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2 hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar for desktop */}
        <aside className="hidden md:block w-64 bg-white shadow-lg h-[calc(100vh-64px)] sticky top-16">
          <nav className="p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            >
              <motion.div
                className="fixed top-0 left-0 w-64 h-full bg-white z-50"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="mb-6 flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                    <User className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.role}</p>
                    </div>
                  </div>
                  <nav className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                          location.pathname === item.path
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 justify-start text-red-600 hover:bg-red-50 rounded-lg mt-4"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      <span>Logout</span>
                    </Button>
                  </nav>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
