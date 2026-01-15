import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Container,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    VerifiedUser as VerifiedIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/common/GlassCard';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, verify } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(email, password, name);
            setIsVerifying(true);
        } catch (error) {
            // Error is handled in context
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await verify(email, verificationCode);
            navigate('/login');
        } catch (error) {
            // Error is handled in context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <GlassCard sx={{ p: 4, width: '100%', borderRadius: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                        {isVerifying ? 'Verify Email' : 'Join TrackMyExpense'}
                    </Typography>
                    <Typography color="text.secondary">
                        {isVerifying
                            ? `Enter the code sent to ${email}`
                            : 'Start your journey to financial freedom today'
                        }
                    </Typography>
                </Box>

                {!isVerifying ? (
                    <form onSubmit={handleSignup}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                variant="outlined"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                            <TextField
                                fullWidth
                                label="Email Address"
                                variant="outlined"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading}
                                sx={{ py: 1.5, borderRadius: 3, fontWeight: 700, textTransform: 'none' }}
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </Button>

                            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                                Already have an account?{' '}
                                <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, textDecoration: 'none' }}>
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                ) : (
                    <form onSubmit={handleVerify}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth
                                label="Verification Code"
                                variant="outlined"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <VerifiedIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading}
                                sx={{ py: 1.5, borderRadius: 3, fontWeight: 700, textTransform: 'none' }}
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Continue'}
                            </Button>

                            <Button
                                fullWidth
                                variant="text"
                                onClick={() => setIsVerifying(false)}
                                sx={{ textTransform: 'none' }}
                            >
                                Back to Signup
                            </Button>
                        </Box>
                    </form>
                )}
            </GlassCard>
        </Container>
    );
};

export default Signup;
