import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: User; token: string }
  | { type: 'LOGIN_FAILURE'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; user: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; loading: boolean };

// State interface
interface AuthState {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Initial state
const initialState: AuthState = {
  currentUser: null,
  token: localStorage.getItem('explicandum_token'),
  isLoading: false,
  error: null,
  isAuthenticated: false
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        currentUser: action.user,
        token: action.token,
        isLoading: false,
        error: null,
        isAuthenticated: true
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.error,
        currentUser: null,
        token: null,
        isAuthenticated: false
      };
    
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        token: null,
        isAuthenticated: false,
        error: null
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        currentUser: action.user
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading
      };
    
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
} | null>(null);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Effect to sync token with localStorage
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('explicandum_token', state.token);
    } else {
      localStorage.removeItem('explicandum_token');
    }
  }, [state.token]);

  // Effect to validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('explicandum_token');
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/auth/validate', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            dispatch({ type: 'LOGIN_SUCCESS', user: data.user, token });
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    validateToken();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Action creators
export const authActions = {
  loginStart: () => ({ type: 'LOGIN_START' as const }),
  loginSuccess: (user: User, token: string) => ({ type: 'LOGIN_SUCCESS' as const, user, token }),
  loginFailure: (error: string) => ({ type: 'LOGIN_FAILURE' as const, error }),
  logout: () => ({ type: 'LOGOUT' as const }),
  updateUser: (user: User) => ({ type: 'UPDATE_USER' as const, user }),
  clearError: () => ({ type: 'CLEAR_ERROR' as const }),
  setLoading: (loading: boolean) => ({ type: 'SET_LOADING' as const, loading })
};
