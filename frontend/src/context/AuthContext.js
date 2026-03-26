import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    const response = await axios.post(`${API}/auth/login`, { email, senha });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const changePassword = async (senhaAtual, novaSenha, confirmacaoSenha) => {
    await axios.put(`${API}/auth/change-password`, {
      senha_atual: senhaAtual,
      nova_senha: novaSenha,
      confirmacao_senha: confirmacaoSenha
    });
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    changePassword,
    isAdmin: user?.role === 'admin',
    isRH: user?.role === 'rh',
    isSuperior: user?.role === 'superior',
    canEdit: user?.role === 'admin' || user?.role === 'rh',
    canDelete: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
