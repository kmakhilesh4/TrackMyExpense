import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Stack,
    Avatar,
    Button,
    Divider,
    Switch,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    TextField,
    Grid,
    CircularProgress
} from '@mui/material';
import {
    Palette as PaletteIcon,
    Notifications as BellIcon,
    Security as LockIcon,
    Brightness4 as DarkModeIcon,
} from '@mui/icons-material';
import GlassCard from '../components/common/GlassCard';
import { useColorMode } from '../App';
import { useAuth } from '../context/AuthContext';
import { fetchUserAttributes } from 'aws-amplify/auth';

const Settings = () => {
    const { mode, toggleColorMode } = useColorMode();
    const { user } = useAuth();
    const [userAttributes, setUserAttributes] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserAttributes = async () => {
            try {
                const attributes = await fetchUserAttributes();
                setUserAttributes(attributes);
            } catch (error) {
                console.error('Failed to fetch user attributes:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadUserAttributes();
        } else {
            setLoading(false);
        }
    }, [user]);

    // Extract user info
    const userEmail = userAttributes?.email || user?.signInDetails?.loginId || user?.username || 'user@example.com';
    const userName = userAttributes?.name || userEmail.split('@')[0] || 'User';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your account preferences and application settings.
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                    <CircularProgress />
                </Box>
            ) : (
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <GlassCard sx={{ textAlign: 'center', p: 4 }}>
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                mx: 'auto',
                                mb: 2,
                                bgcolor: 'primary.main',
                                fontSize: '2.5rem',
                                fontWeight: 700,
                                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)'
                            }}
                        >
                            {userInitial}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>{userName}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>{userEmail}</Typography>
                        <Button variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>Edit Profile</Button>
                    </GlassCard>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                        <GlassCard>
                            <Box sx={{ p: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <PaletteIcon sx={{ mr: 2, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Appearance</Typography>
                                </Box>
                                <List disablePadding>
                                    <ListItem
                                        secondaryAction={
                                            <Switch
                                                edge="end"
                                                checked={mode === 'dark'}
                                                onChange={toggleColorMode}
                                            />
                                        }
                                    >
                                        <ListItemIcon>
                                            <DarkModeIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Dark Mode"
                                            secondary="Toggle between light and dark theme"
                                        />
                                    </ListItem>
                                </List>
                            </Box>
                        </GlassCard>

                        <GlassCard>
                            <Box sx={{ p: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <BellIcon sx={{ mr: 2, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Notifications</Typography>
                                </Box>
                                <List disablePadding>
                                    <ListItem secondaryAction={<Switch edge="end" defaultChecked />}>
                                        <ListItemText
                                            primary="Email Notifications"
                                            secondary="Receive weekly summaries and alerts"
                                        />
                                    </ListItem>
                                    <Divider sx={{ my: 1, opacity: 0.5 }} />
                                    <ListItem secondaryAction={<Switch edge="end" defaultChecked />}>
                                        <ListItemText
                                            primary="Budget Alerts"
                                            secondary="Get notified when you reach 90% of your budget"
                                        />
                                    </ListItem>
                                </List>
                            </Box>
                        </GlassCard>

                        <GlassCard>
                            <Box sx={{ p: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <LockIcon sx={{ mr: 2, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Security</Typography>
                                </Box>
                                <Stack spacing={2}>
                                    <TextField
                                        fullWidth
                                        label="Change Password"
                                        type="password"
                                        size="small"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                    <Button variant="contained" sx={{ width: 'fit-content', borderRadius: 2 }}>Update Security</Button>
                                </Stack>
                            </Box>
                        </GlassCard>
                    </Stack>
                </Grid>
            </Grid>
            )}
        </Box>
    );
};

export default Settings;
