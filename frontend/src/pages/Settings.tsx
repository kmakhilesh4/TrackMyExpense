import { useState, useEffect, useRef } from 'react';
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
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';
import {
    Palette as PaletteIcon,
    Notifications as BellIcon,
    Security as LockIcon,
    Brightness4 as DarkModeIcon,
    Edit as EditIcon,
    PhotoCamera as PhotoCameraIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import GlassCard from '../components/common/GlassCard';
import { useColorMode } from '../App';
import { useAuth } from '../context/AuthContext';
import { fetchUserAttributes, updateUserAttributes, updatePassword } from 'aws-amplify/auth';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const { mode, toggleColorMode } = useColorMode();
    const { user } = useAuth();
    const [userAttributes, setUserAttributes] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [editName, setEditName] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

    useEffect(() => {
        loadUserAttributes();
    }, [user]);

    const loadUserAttributes = async () => {
        try {
            const attributes = await fetchUserAttributes();
            setUserAttributes(attributes);
            setEditName(attributes.name || '');
            
            // Load profile picture if exists
            if (attributes.picture) {
                try {
                    const result = await getUrl({
                        key: attributes.picture,
                        options: {
                            accessLevel: 'private',
                        },
                    });
                    setProfilePictureUrl(result.url.toString());
                } catch (error) {
                    console.error('Failed to load profile picture:', error);
                }
            }
        } catch (error) {
            console.error('Failed to fetch user attributes:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const fileName = `profile-pictures/${user?.userId || 'user'}-${Date.now()}.${file.name.split('.').pop()}`;
            
            // Upload to S3
            await uploadData({
                key: fileName,
                data: file,
                options: {
                    accessLevel: 'private',
                    contentType: file.type,
                },
            }).result;

            // Update user attribute
            await updateUserAttributes({
                userAttributes: {
                    picture: fileName,
                },
            });

            // Reload attributes
            await loadUserAttributes();
            toast.success('Profile picture updated successfully!');
        } catch (error: any) {
            console.error('Failed to upload profile picture:', error);
            toast.error(error.message || 'Failed to upload profile picture');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await updateUserAttributes({
                userAttributes: {
                    name: editName,
                },
            });
            await loadUserAttributes();
            setEditDialogOpen(false);
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            toast.error(error.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        try {
            await updatePassword({
                oldPassword,
                newPassword,
            });
            setPasswordDialogOpen(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast.success('Password changed successfully!');
        } catch (error: any) {
            console.error('Failed to change password:', error);
            toast.error(error.message || 'Failed to change password');
        }
    };

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
                            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                <Avatar
                                    src={profilePictureUrl || undefined}
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
                                    {!profilePictureUrl && userInitial}
                                </Avatar>
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        bottom: 10,
                                        right: -5,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        width: 35,
                                        height: 35,
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon fontSize="small" />}
                                </IconButton>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleProfilePictureUpload}
                                />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{userName}</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>{userEmail}</Typography>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                sx={{ mt: 2, borderRadius: 2 }}
                                onClick={() => setEditDialogOpen(true)}
                            >
                                Edit Profile
                            </Button>
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
                                                primary="Transaction Alerts"
                                                secondary="Get notified about important transactions"
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
                                        <Typography variant="body2" color="text.secondary">
                                            Keep your account secure by using a strong password
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            sx={{ width: 'fit-content', borderRadius: 2 }}
                                            onClick={() => setPasswordDialogOpen(true)}
                                        >
                                            Change Password
                                        </Button>
                                    </Stack>
                                </Box>
                            </GlassCard>
                        </Stack>
                    </Grid>
                </Grid>
            )}

            {/* Edit Profile Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Edit Profile
                    <IconButton onClick={() => setEditDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            value={userEmail}
                            disabled
                            helperText="Email cannot be changed"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setEditDialogOpen(false)} sx={{ borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleUpdateProfile} sx={{ borderRadius: 2 }}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Change Password
                    <IconButton onClick={() => setPasswordDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Current Password"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            helperText="Must be at least 8 characters with uppercase, lowercase, number and symbol"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setPasswordDialogOpen(false)} sx={{ borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        sx={{ borderRadius: 2 }}
                        disabled={!oldPassword || !newPassword || !confirmPassword}
                    >
                        Change Password
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Settings;
