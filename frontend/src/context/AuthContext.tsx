import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signOut, signIn, signUp, confirmSignUp, AuthUser, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    verify: (email: string, code: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {
        const unsubscribe = Hub.listen('auth', ({ payload }) => {
            switch (payload.event) {
                case 'signedIn':
                    checkUser();
                    // Clear cache and refetch on sign in
                    queryClient.clear();
                    break;
                case 'signedOut':
                    setUser(null);
                    setIsAuthenticated(false);
                    // Clear all cached data on sign out
                    queryClient.clear();
                    break;
            }
        });

        checkUser();

        return () => unsubscribe();
    }, [queryClient]);

    const checkUser = async () => {
        try {
            console.log('checkUser called');
            const currentUser = await getCurrentUser();
            console.log('Current user:', currentUser);
            if (currentUser) {
                setUser(currentUser);
                setIsAuthenticated(true);
                console.log('User authenticated:', currentUser);
            } else {
                setUser(null);
                setIsAuthenticated(false);
                console.log('No user found');
            }
        } catch (error: any) {
            console.error('checkUser error:', error);
            // User might still be logged in even if getCurrentUser fails
            // Check if we have a valid session
            try {
                const session = await fetchAuthSession();
                if (session?.tokens?.accessToken) {
                    console.log('Valid session found, user is authenticated');
                    setIsAuthenticated(true);
                    // Set minimal user data
                    setUser({
                        userId: 'unknown',
                        username: 'user',
                    } as AuthUser);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (e) {
                setUser(null);
                setIsAuthenticated(false);
            }
        } finally {
            setIsLoading(false);
            console.log('AuthProvider loading complete');
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const { isSignedIn } = await signIn({ username: email, password });
            if (isSignedIn) {
                await checkUser();
                toast.success('Login successful!');
                // Navigation will be handled by the component
            }
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.message || 'Failed to login');
            throw error;
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email,
                        name,
                    }
                }
            });
            toast.success('Registration successful! Please check your email for a verification code.');
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Failed to register');
            throw error;
        }
    };

    const verify = async (email: string, code: string) => {
        try {
            await confirmSignUp({
                username: email,
                confirmationCode: code
            });
            toast.success('Verification successful! You can now log in.');
        } catch (error: any) {
            console.error('Verification error:', error);
            toast.error(error.message || 'Failed to verify code');
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Clear all cached data BEFORE signing out
            queryClient.clear();
            
            await signOut();
            setUser(null);
            setIsAuthenticated(false);
            toast.success('Logged out successfully');
            // Navigation will be handled by the component
        } catch (error: any) {
            setUser(null);
            setIsAuthenticated(false);
            // Still clear cache even on error
            queryClient.clear();
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, verify, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
