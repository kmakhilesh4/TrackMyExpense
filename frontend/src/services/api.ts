import axios, { AxiosInstance, AxiosError } from 'axios';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            async (config) => {
                try {
                    const session = await fetchAuthSession();
                    const token = session.tokens?.accessToken?.toString();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (error) {
                    console.error('Error fetching auth session', error);
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    const currentPath = window.location.pathname;
                    const isAuthPage = currentPath === '/login' || currentPath === '/signup';

                    // Prevent redirect loop - don't redirect if already on auth pages
                    if (!isAuthPage) {
                        console.error('Authentication failed (401). Redirecting to login.', {
                            url: error.config?.url,
                            currentPath,
                        });

                        try {
                            await signOut();
                        } catch (e) {
                            console.error('Error signing out on 401', e);
                        }

                        // Use navigate instead of window.location to avoid full page reload
                        window.location.href = '/login';
                    } else {
                        console.warn('Received 401 while on auth page, not redirecting to prevent loop');
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    getInstance(): AxiosInstance {
        return this.client;
    }
}

export const apiClient = new ApiClient().getInstance();
