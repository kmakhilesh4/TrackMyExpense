import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import theme from './theme';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                    <div className="app">
                        <h1>TrackMyExpense</h1>
                        <p>Modern Expense Tracking Application</p>
                        <p style={{ color: '#10b981', marginTop: '20px' }}>
                            ✓ Project structure created successfully!
                        </p>
                        <p style={{ color: '#6366f1' }}>
                            Next: Setting up routing, authentication, and UI components...
                        </p>
                    </div>
                </BrowserRouter>
                <Toaster position="top-right" />
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
