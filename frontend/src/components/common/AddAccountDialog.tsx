import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    InputAdornment,
    Box,
    CircularProgress,
} from '@mui/material';
import { useAccounts } from '../../hooks/useAccounts';

interface AddAccountDialogProps {
    open: boolean;
    onClose: () => void;
}

const AddAccountDialog = ({ open, onClose }: AddAccountDialogProps) => {
    const { createAccount } = useAccounts();

    const [formData, setFormData] = useState({
        accountName: '',
        accountType: 'checking' as 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment',
        balance: '',
        currency: 'INR',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await createAccount.mutateAsync({
                accountName: formData.accountName,
                accountType: formData.accountType,
                balance: parseFloat(formData.balance) || 0,
                currency: formData.currency,
                isActive: true,
            });
            handleClose();
        } catch (error) {
            console.error('Failed to create account:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            accountName: '',
            accountType: 'checking',
            balance: '',
            currency: 'INR',
        });
        onClose();
    };

    const isValid = formData.accountName && formData.accountType && formData.currency;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Account</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="Account Name"
                        fullWidth
                        value={formData.accountName}
                        onChange={(e) => handleChange('accountName', e.target.value)}
                        placeholder="e.g., Main Checking, Savings Account"
                    />

                    <FormControl fullWidth>
                        <InputLabel>Account Type</InputLabel>
                        <Select
                            value={formData.accountType}
                            label="Account Type"
                            onChange={(e) => handleChange('accountType', e.target.value)}
                        >
                            <MenuItem value="checking">🏦 Checking</MenuItem>
                            <MenuItem value="savings">💰 Savings</MenuItem>
                            <MenuItem value="credit_card">💳 Credit Card</MenuItem>
                            <MenuItem value="cash">💵 Cash</MenuItem>
                            <MenuItem value="investment">📈 Investment</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Initial Balance"
                        type="number"
                        fullWidth
                        value={formData.balance}
                        onChange={(e) => handleChange('balance', e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                        helperText="Leave empty for 0 balance"
                    />

                    <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <Select
                            value={formData.currency}
                            label="Currency"
                            onChange={(e) => handleChange('currency', e.target.value)}
                        >
                            <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                            <MenuItem value="USD">USD - US Dollar</MenuItem>
                            <MenuItem value="EUR">EUR - Euro</MenuItem>
                            <MenuItem value="GBP">GBP - British Pound</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={!isValid || isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Add Account'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddAccountDialog;
