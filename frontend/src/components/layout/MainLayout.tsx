import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
    useMediaQuery,
    Avatar,
    Tooltip,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    AccountBalanceWallet as AccountIcon,
    Receipt as TransactionIcon,
    // PieChart as AnalyticsIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useColorMode } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';

const drawerWidth = 260;

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const { mode, toggleColorMode } = useColorMode();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    // Load profile picture from API (stored in DynamoDB)
    useEffect(() => {
        const loadProfilePicture = async () => {
            if (user?.userId || user?.username) {
                try {
                    const response = await apiClient.get('/profile/picture/url');
                    console.log('MainLayout - API response:', response.data);
                    const url = response.data.data?.url || response.data.url;
                    if (url && url !== 'none') {
                        console.log('MainLayout - Setting profile picture URL:', url);
                        setProfilePictureUrl(url);
                    } else {
                        console.log('MainLayout - No picture URL found');
                        setProfilePictureUrl(null);
                    }
                } catch (error) {
                    console.log('MainLayout - No profile picture found or error:', error);
                    setProfilePictureUrl(null);
                }
            } else {
                setProfilePictureUrl(null);
            }
        };

        // Load immediately on mount or user change
        loadProfilePicture();

        // Refresh picture every 30 minutes for cross-device sync
        const interval = setInterval(loadProfilePicture, 30 * 60 * 1000); // 30 minutes

        return () => {
            clearInterval(interval);
        };
    }, [user?.userId, user?.username]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Accounts', icon: <AccountIcon />, path: '/accounts' },
        { text: 'Transactions', icon: <TransactionIcon />, path: '/transactions' },
        // { text: 'Budgets', icon: <AnalyticsIcon />, path: '/budgets' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ];

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{ px: [2], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountIcon sx={{ color: '#6366f1' }} />
                    TrackExp
                </Typography>
            </Toolbar>
            <Divider sx={{ opacity: 0.5 }} />
            <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setMobileOpen(false);
                            }}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 45, color: location.pathname === item.path ? 'white' : 'text.secondary' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 700 : 500 }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ opacity: 0.5 }} />
            <Box sx={{ p: 2 }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{ borderRadius: 2, color: 'error.main' }}
                >
                    <ListItemIcon sx={{ minWidth: 45, color: 'error.main' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />
            {!isAuthPage && (
                <>
                    <AppBar
                        position="fixed"
                        sx={{
                            width: { md: `calc(100% - ${drawerWidth}px)` },
                            ml: { md: `${drawerWidth}px` },
                        }}
                    >
                        <Toolbar>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 2, display: { md: 'none' } }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                                {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                                    <IconButton onClick={toggleColorMode} color="inherit">
                                        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                                    </IconButton>
                                </Tooltip>
                                <IconButton color="inherit">
                                    <NotificationsIcon />
                                </IconButton>
                                <Avatar
                                    src={profilePictureUrl || undefined}
                                    onClick={() => navigate('/settings')}
                                    sx={{
                                        ml: 1,
                                        width: 35,
                                        height: 35,
                                        bgcolor: 'primary.main',
                                        cursor: 'pointer',
                                        border: '2px solid transparent',
                                        transition: 'all 0.2s',
                                        '&:hover': { borderColor: 'primary.light' }
                                    }}
                                >
                                    {!profilePictureUrl && (user?.signInDetails?.loginId?.charAt(0).toUpperCase() || 'U')}
                                </Avatar>
                            </Box>
                        </Toolbar>
                    </AppBar>
                    <Box
                        component="nav"
                        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                        aria-label="mailbox folders"
                    >
                        <Drawer
                            variant="temporary"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{ keepMounted: true }}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                            }}
                        >
                            {drawer}
                        </Drawer>
                        <Drawer
                            variant="permanent"
                            sx={{
                                display: { xs: 'none', md: 'block' },
                                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                            }}
                            open
                        >
                            {drawer}
                        </Drawer>
                    </Box>
                </>
            )}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    p: isAuthPage ? 0 : 3,
                    width: isAuthPage ? '100%' : { md: `calc(100% - ${drawerWidth}px)` },
                    backgroundColor: 'background.default',
                    mt: isAuthPage ? 0 : '64px',
                }}
            >
                <Box sx={{ flexGrow: 1 }}>
                    {children}
                </Box>
                
                {/* Footer */}
                {!isAuthPage && (
                    <Box
                        component="footer"
                        sx={{
                            mt: 'auto',
                            pt: 4,
                            pb: 2,
                            textAlign: 'center',
                            borderTop: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Built with ❤️ by Akhilesh
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            © {new Date().getFullYear()} TrackMyExpense. All rights reserved.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default MainLayout;
