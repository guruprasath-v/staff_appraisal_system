import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { login as apiLogin, logout as apiLogout } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user data is stored in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiLogin(email, password);

      if (response.success) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Redirect based on role
        if (response.user.role.toLowerCase() === "admin") {
          navigate("/admin");
        } else if (response.user.role.toLowerCase() === "hod") {
          navigate("/hod");
        } else if (response.user.role.toLowerCase() === "staff") {
          navigate("/staff");
        }

        toast.success("Login successful!");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiLogout();
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
