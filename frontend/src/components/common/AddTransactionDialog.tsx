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
    Alert,
} from '@mui/material';
import { useAccounts } from '../../hooks/useAccounts';
import { useCategories } from '../../hooks/useCategories';
import { useTransactions } from '../../hooks/useTransactions';
import AddCategoryDialog from './AddCategoryDialog';

interface AddTransactionDialogProps {
    open: boolean;
    onClose: () => void;
}

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

const AddTransactionDialog = ({ open, onClose }: AddTransactionDialogProps) => {
    const { accounts } = useAccounts();
    const { categories } = useCategories();
    const { createTransaction } = useTransactions();

    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);

    const [formData, setFormData] = useState({
        accountId: '',
        categoryId: '',
        type: 'expense' as 'expense' | 'income',
        amount: '',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
    });

    // Get selected account's currency
    const selectedAccount = accounts.find(acc => {
        const accountId = acc.EntityType.split('#')[1];
        return accountId === formData.accountId;
    });
    const currencySymbol = selectedAccount ? getCurrencySymbol(selectedAccount.currency) : '₹';

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await createTransaction.mutateAsync({
                accountId: formData.accountId,
                categoryId: formData.categoryId,
                type: formData.type,
                amount: parseFloat(formData.amount),
                description: formData.description,
                transactionDate: new Date(formData.transactionDate).toISOString(),
            });
            handleClose();
        } catch (error) {
            console.error('Failed to create transaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            accountId: '',
            categoryId: '',
            type: 'expense',
            amount: '',
            description: '',
            transactionDate: new Date().toISOString().split('T')[0],
        });
        onClose();
    };

    const filteredCategories = categories.filter(cat => {
        return cat.type === formData.type;
    });

    const isValid = formData.accountId && formData.categoryId && formData.amount && 
                    formData.description && formData.transactionDate;

    return (
        <>
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {categories.length === 0 && (
                        <Alert severity="info">
                            No categories found. Click "Add New Category" button below to create one.
                        </Alert>
                    )}

                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={formData.type}
                            label="Type"
                            onChange={(e) => {
                                handleChange('type', e.target.value);
                                handleChange('categoryId', ''); // Reset category when type changes
                            }}
                        >
                            <MenuItem value="expense">Expense</MenuItem>
                            <MenuItem value="income">Income</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Account</InputLabel>
                        <Select
                            value={formData.accountId}
                            label="Account"
                            onChange={(e) => handleChange('accountId', e.target.value)}
                        >
                            {accounts.map((account) => {
                                const accountId = account.EntityType.split('#')[1];
                                return (
                                    <MenuItem key={accountId} value={accountId}>
                                        {account.accountName} ({account.currency} {account.balance.toFixed(2)})
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formData.categoryId}
                            label="Category"
                            onChange={(e) => handleChange('categoryId', e.target.value)}
                            disabled={!formData.type || categories.length === 0}
                        >
                            {filteredCategories.length === 0 && (
                                <MenuItem disabled>
                                    No {formData.type} categories available
                                </MenuItem>
                            )}
                            {filteredCategories.map((category) => {
                                const categoryId = category.EntityType.split('#')[1];
                                return (
                                    <MenuItem key={categoryId} value={categoryId}>
                                        {category.icon} {category.name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    <Button
                        variant="outlined"
                        onClick={() => setOpenCategoryDialog(true)}
                        fullWidth
                        sx={{ mt: -1 }}
                    >
                        + Add New Category
                    </Button>

                    <TextField
                        label="Amount"
                        type="number"
                        fullWidth
                        value={formData.amount}
                        onChange={(e) => handleChange('amount', e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                    />

                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />

                    <TextField
                        label="Date"
                        type="date"
                        fullWidth
                        value={formData.transactionDate}
                        onChange={(e) => handleChange('transactionDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
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
                    {isSubmitting ? <CircularProgress size={24} /> : 'Add Transaction'}
                </Button>
            </DialogActions>
        </Dialog>

        <AddCategoryDialog 
            open={openCategoryDialog} 
            onClose={() => setOpenCategoryDialog(false)} 
        />
    </>
    );
};

export default AddTransactionDialog;
