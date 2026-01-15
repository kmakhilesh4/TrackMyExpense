import { createTheme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Function to generate the theme based on the mode
export const getThemeOptions = (mode: PaletteMode): ThemeOptions => {
    const isDark = mode === 'dark';

    const colors = {
        primary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
            contrastText: '#ffffff',
        },
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
        background: {
            default: isDark ? '#0f172a' : '#f8fafc',
            paper: isDark ? '#1e293b' : '#ffffff',
        },
        text: {
            primary: isDark ? '#f1f5f9' : '#1e293b',
            secondary: isDark ? '#94a3b8' : '#64748b',
        },
    };

    return {
        palette: {
            mode,
            ...colors,
            divider: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)',
        },
        typography: {
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
            h1: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' },
            h2: { fontWeight: 600, fontSize: '2rem', letterSpacing: '-0.01em' },
            h3: { fontWeight: 600, fontSize: '1.75rem' },
            h4: { fontWeight: 600, fontSize: '1.5rem' },
            h5: { fontWeight: 600, fontSize: '1.25rem' },
            h6: { fontWeight: 600, fontSize: '1rem' },
            button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        scrollbarColor: isDark ? '#334155 #0f172a' : '#cbd5e1 #f8fafc',
                        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                            width: '8px',
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                            borderRadius: '8px',
                            backgroundColor: isDark ? '#334155' : '#cbd5e1',
                        },
                        '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
                            backgroundColor: 'transparent',
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        padding: '8px 20px',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                        },
                    },
                    contained: {
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: isDark
                                ? '0 4px 12px rgba(99, 102, 241, 0.4)'
                                : '0 4px 12px rgba(99, 102, 241, 0.2)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: isDark
                            ? '1px solid rgba(148, 163, 184, 0.1)'
                            : '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: 20,
                        boxShadow: isDark
                            ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
                            : '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        boxShadow: 'none',
                        borderBottom: isDark
                            ? '1px solid rgba(148, 163, 184, 0.1)'
                            : '1px solid rgba(148, 163, 184, 0.1)',
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        borderRight: isDark
                            ? '1px solid rgba(148, 163, 184, 0.1)'
                            : '1px solid rgba(148, 163, 184, 0.1)',
                    },
                },
            },
        },
    };
};

export const theme = (mode: PaletteMode) => createTheme(getThemeOptions(mode));

export default theme;
