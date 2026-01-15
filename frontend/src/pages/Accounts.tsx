import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    IconButton,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    AccountBalance as BankIcon,
    CreditCard as CardIcon,
    AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import GlassCard from '../components/common/GlassCard';
import AddAccountDialog from '../components/common/AddAccountDialog';
import { useAccounts } from '../hooks/useAccounts';

const Accounts = () => {
    const { accounts, isLoading } = useAccounts();
    const [openDialog, setOpenDialog] = useState(false);

    const getIcon = (type: string) => {
        switch (type) {
            case 'checking': return <BankIcon />;
            case 'savings': return <WalletIcon />;
            case 'credit_card': return <CardIcon />;
            default: return <WalletIcon />;
        }
    };

    const getAccountColor = (type: string) => {
        switch (type) {
            case 'checking': return '#6366f1';
            case 'savings': return '#10b981';
            case 'credit_card': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        Accounts
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your bank accounts and credit cards in one place.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ px: 3, py: 1.2, borderRadius: 2 }}
                    onClick={() => setOpenDialog(true)}
                >
                    Add Account
                </Button>
            </Box>

            <Grid container spacing={3}>
                {accounts.length === 0 && (
                    <Grid item xs={12}>
                        <GlassCard sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary">No accounts found. Add your first account to get started!</Typography>
                        </GlassCard>
                    </Grid>
                )}
                {accounts.map((account) => (
                    <Grid item xs={12} md={4} key={account.EntityType}>
                        <GlassCard sx={{ borderLeft: `4px solid ${getAccountColor(account.accountType)} !important`, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: `${getAccountColor(account.accountType)}20`,
                                        color: getAccountColor(account.accountType),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {getIcon(account.accountType)}
                                </Box>
                                <IconButton size="small">
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>

                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {account.accountName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ textTransform: 'capitalize' }}>
                                {account.accountType.replace('_', ' ')} Account
                            </Typography>

                            <Box sx={{ mt: 'auto', pt: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                    CURRENT BALANCE
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: account.balance < 0 ? 'error.main' : 'text.primary' }}>
                                    {account.balance < 0 ? '- ' : ''}${Math.abs(account.balance).toLocaleString()}
                                </Typography>
                            </Box>
                        </GlassCard>
                    </Grid>
                ))}
            </Grid>

            <AddAccountDialog open={openDialog} onClose={() => setOpenDialog(false)} />
        </Box>
    );
};

export default Accounts;
