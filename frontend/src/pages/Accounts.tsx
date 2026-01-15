import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    IconButton,
    CircularProgress,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    DialogContentText,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    AccountBalance as BankIcon,
    CreditCard as CardIcon,
    AccountBalanceWallet as WalletIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import GlassCard from '../components/common/GlassCard';
import AddAccountDialog from '../components/common/AddAccountDialog';
import { useAccounts } from '../hooks/useAccounts';

// Currency symbol mapping
const getCurrencySymbol = (currency: string): string => {
    const symbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'INR': '₹',
        'JPY': '¥',
        'CNY': '¥',
        'AUD': 'A$',
        'CAD': 'C$',
    };
    return symbols[currency] || currency;
};

const Accounts = () => {
    const { accounts, isLoading, updateAccount, deleteAccount } = useAccounts();
    const [openDialog, setOpenDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editBalance, setEditBalance] = useState('');

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, account: any) => {
        setAnchorEl(event.currentTarget);
        setSelectedAccount(account);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditClick = () => {
        if (selectedAccount) {
            setEditBalance(selectedAccount.balance.toString());
            setEditDialogOpen(true);
            handleMenuClose();
        }
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
        handleMenuClose();
    };

    const handleEditSubmit = async () => {
        if (selectedAccount) {
            const accountId = selectedAccount.EntityType.split('#')[1];
            await updateAccount.mutateAsync({
                accountId,
                data: { balance: parseFloat(editBalance) }
            });
            setEditDialogOpen(false);
            setSelectedAccount(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (selectedAccount) {
            const accountId = selectedAccount.EntityType.split('#')[1];
            await deleteAccount.mutateAsync(accountId);
            setDeleteDialogOpen(false);
            setSelectedAccount(null);
        }
    };

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
                {accounts.map((account) => {
                    const currencySymbol = getCurrencySymbol(account.currency);
                    
                    return (
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
                                <IconButton size="small" onClick={(e) => handleMenuOpen(e, account)}>
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
                                    {account.balance < 0 ? '- ' : ''}{currencySymbol}{Math.abs(account.balance).toLocaleString()}
                                </Typography>
                            </Box>
                        </GlassCard>
                    </Grid>
                    );
                })}
            </Grid>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEditClick}>
                    <EditIcon sx={{ mr: 1, fontSize: 20 }} />
                    Edit Balance
                </MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                    Delete Account
                </MenuItem>
            </Menu>

            {/* Edit Balance Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Edit Account Balance</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Account: {selectedAccount?.accountName}
                        </Typography>
                        <TextField
                            label="New Balance"
                            type="number"
                            fullWidth
                            value={editBalance}
                            onChange={(e) => setEditBalance(e.target.value)}
                            inputProps={{ step: 0.01 }}
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleEditSubmit} 
                        variant="contained"
                        disabled={!editBalance || updateAccount.isPending}
                    >
                        {updateAccount.isPending ? <CircularProgress size={24} /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Account?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{selectedAccount?.accountName}</strong>? 
                        This action cannot be undone and will remove all associated transactions.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        variant="contained" 
                        color="error"
                        disabled={deleteAccount.isPending}
                    >
                        {deleteAccount.isPending ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <AddAccountDialog open={openDialog} onClose={() => setOpenDialog(false)} />
        </Box>
    );
};

export default Accounts;
