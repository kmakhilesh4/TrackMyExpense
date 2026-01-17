import { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Stack,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Chip,
    IconButton,
    CircularProgress,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    FormControl,
    InputLabel,
    Select,
    Card,
    CardContent,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    ArrowUpward as ExpenseIcon,
    ArrowDownward as IncomeIcon,
    MoreVert as MoreVertIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    SwapVert as SwapVertIcon,
} from '@mui/icons-material';
import GlassCard from '../components/common/GlassCard';
import AddTransactionDialog from '../components/common/AddTransactionDialog';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
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

const Transactions = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAccount, setFilterAccount] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    const { transactions, isLoading: txLoading, deleteTransaction } = useTransactions();
    const { categories } = useCategories();
    const { accounts } = useAccounts();
    
    const [openDialog, setOpenDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const categoryMap = useMemo(() => {
        if (!categories || categories.length === 0) return {};
        return categories.reduce((acc, cat) => {
            const categoryId = cat.EntityType?.split('#')[1] || cat.EntityType;
            acc[categoryId] = cat;
            return acc;
        }, {} as Record<string, any>);
    }, [categories]);

    const accountMap = useMemo(() => {
        if (!accounts || accounts.length === 0) return {};
        return accounts.reduce((acc, account) => {
            const accountId = account.EntityType?.split('#')[1] || account.EntityType;
            acc[accountId] = account;
            return acc;
        }, {} as Record<string, any>);
    }, [accounts]);

    // Filter and sort transactions
    const filteredTransactions = useMemo(() => {
        const filtered = transactions.filter(tx => {
            const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAccount = !filterAccount || tx.accountId === filterAccount;
            const matchesCategory = !filterCategory || tx.categoryId === filterCategory;
            const matchesType = !filterType || tx.type === filterType;
            return matchesSearch && matchesAccount && matchesCategory && matchesType;
        });

        // Sort transactions
        return filtered.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'date') {
                comparison = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
            } else if (sortBy === 'amount') {
                comparison = a.amount - b.amount;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [transactions, searchTerm, filterAccount, filterCategory, filterType, sortBy, sortOrder]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tx: any) => {
        setAnchorEl(event.currentTarget);
        setSelectedTx(tx);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        if (selectedTx) {
            await deleteTransaction.mutateAsync(selectedTx.EntityType);
            setDeleteDialogOpen(false);
            setSelectedTx(null);
        }
    };

    const clearFilters = () => {
        setFilterAccount('');
        setFilterCategory('');
        setFilterType('');
        setSearchTerm('');
    };

    const handleExport = () => {
        // Convert transactions to CSV
        const headers = ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount'];
        const csvData = filteredTransactions.map(tx => {
            const category = categoryMap[tx.categoryId];
            const account = accountMap[tx.accountId];
            return [
                new Date(tx.transactionDate).toLocaleDateString(),
                tx.description,
                category?.name || tx.categoryId,
                account?.accountName || tx.accountId,
                tx.type,
                tx.amount.toFixed(2)
            ];
        });

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Show loading only for transactions, not categories
    if (txLoading) {
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
                        Transactions
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Detailed history of all your financial activities.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        disabled={filteredTransactions.length === 0}
                        sx={{ px: 3, py: 1.2, borderRadius: 2 }}
                    >
                        Export
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ px: 3, py: 1.2, borderRadius: 2 }}
                        onClick={() => setOpenDialog(true)}
                    >
                        Add New
                    </Button>
                </Stack>
            </Box>

            <GlassCard sx={{ mb: 3, p: '16px !important' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        fullWidth
                        placeholder="Search transactions..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<FilterIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{
                            borderRadius: 2,
                            whiteSpace: 'nowrap',
                            bgcolor: showFilters ? 'rgba(99, 102, 241, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                            '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.2)' }
                        }}
                    >
                        Filter
                    </Button>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortBy}
                            label="Sort By"
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="date">Date</MenuItem>
                            <MenuItem value="amount">Amount</MenuItem>
                        </Select>
                    </FormControl>
                    <IconButton
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        sx={{
                            bgcolor: 'rgba(148, 163, 184, 0.1)',
                            '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.2)' }
                        }}
                    >
                        <SwapVertIcon />
                    </IconButton>
                    {(filterAccount || filterCategory || filterType || searchTerm) && (
                        <Button
                            variant="text"
                            startIcon={<CloseIcon />}
                            onClick={clearFilters}
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            Clear
                        </Button>
                    )}
                </Stack>

                {showFilters && (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Account</InputLabel>
                            <Select
                                value={filterAccount}
                                label="Account"
                                onChange={(e) => setFilterAccount(e.target.value)}
                            >
                                <MenuItem value="">All Accounts</MenuItem>
                                {accounts.map((account) => {
                                    const accountId = account.EntityType.split('#')[1];
                                    return (
                                        <MenuItem key={accountId} value={accountId}>
                                            {account.accountName}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>

                        <FormControl size="small" fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={filterCategory}
                                label="Category"
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <MenuItem value="">All Categories</MenuItem>
                                {categories.map((category) => {
                                    const categoryId = category.EntityType.split('#')[1];
                                    return (
                                        <MenuItem key={categoryId} value={categoryId}>
                                            {category.icon} {category.name}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>

                        <FormControl size="small" fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={filterType}
                                label="Type"
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <MenuItem value="">All Types</MenuItem>
                                <MenuItem value="expense">Expense</MenuItem>
                                <MenuItem value="income">Income</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                )}
            </GlassCard>

            {/* Mobile View - Cards */}
            {isMobile ? (
                <Stack spacing={2}>
                    {filteredTransactions.length === 0 && (
                        <GlassCard sx={{ textAlign: 'center', py: 8 }}>
                            <Typography color="text.secondary">
                                {transactions.length === 0 ? 'No transactions found.' : 'No transactions match your filters.'}
                            </Typography>
                        </GlassCard>
                    )}
                    {filteredTransactions.map((tx) => {
                        const category = categoryMap[tx.categoryId];
                        const account = accountMap[tx.accountId];
                        const currencySymbol = account ? getCurrencySymbol(account.currency) : '$';
                        
                        return (
                            <Card 
                                key={tx.EntityType}
                                sx={{ 
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                }}
                            >
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: tx.type === 'expense' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    color: tx.type === 'expense' ? 'error.main' : 'success.main',
                                                    width: 40,
                                                    height: 40
                                                }}
                                            >
                                                {tx.type === 'expense' ? <ExpenseIcon fontSize="small" /> : <IncomeIcon fontSize="small" />}
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
                                                    {tx.description}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {account?.accountName || tx.accountId}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, tx)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Stack>
                                    
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip
                                                label={category?.name || tx.categoryId}
                                                size="small"
                                                icon={<span>{category?.icon}</span>}
                                                sx={{
                                                    fontWeight: 600,
                                                    bgcolor: category?.color ? `${category.color}20` : 'rgba(99, 102, 241, 0.1)',
                                                    color: category?.color || 'primary.main',
                                                    borderRadius: 1
                                                }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(tx.transactionDate).toLocaleDateString()}
                                            </Typography>
                                        </Stack>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ fontWeight: 700, color: tx.type === 'expense' ? 'error.main' : 'success.main' }}
                                        >
                                            {tx.type === 'expense' ? '- ' : '+'}{currencySymbol}{tx.amount.toFixed(2)}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            ) : (
                /* Desktop View - Table */
                <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none', backgroundImage: 'none' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ '& .MuiTableCell-head': { fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' } }}>
                            <TableRow>
                                <TableCell>TRANSACTION</TableCell>
                                <TableCell>CATEGORY</TableCell>
                                <TableCell>DATE</TableCell>
                                <TableCell align="right">AMOUNT</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTransactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">
                                            {transactions.length === 0 ? 'No transactions found.' : 'No transactions match your filters.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredTransactions.map((tx) => {
                                const category = categoryMap[tx.categoryId];
                                const account = accountMap[tx.accountId];
                                const currencySymbol = account ? getCurrencySymbol(account.currency) : '$';
                                
                                return (
                                    <TableRow
                                        key={tx.EntityType}
                                        sx={{
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.03)' },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        bgcolor: tx.type === 'expense' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                        color: tx.type === 'expense' ? 'error.main' : 'success.main',
                                                        width: 40,
                                                        height: 40
                                                    }}
                                                >
                                                    {tx.type === 'expense' ? <ExpenseIcon fontSize="small" /> : <IncomeIcon fontSize="small" />}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {tx.description}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {account?.accountName || tx.accountId}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={category?.name || tx.categoryId}
                                                size="small"
                                                icon={<span>{category?.icon}</span>}
                                                sx={{
                                                    fontWeight: 600,
                                                    bgcolor: category?.color ? `${category.color}20` : 'rgba(99, 102, 241, 0.1)',
                                                    color: category?.color || 'primary.main',
                                                    borderRadius: 1
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{new Date(tx.transactionDate).toLocaleDateString()}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: tx.type === 'expense' ? 'error.main' : 'success.main' }}>
                                                {tx.type === 'expense' ? '- ' : '+'}{currencySymbol}{tx.amount.toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, tx)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                    Delete Transaction
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Transaction?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this transaction? 
                        This will also update your account balance. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        variant="contained" 
                        color="error"
                        disabled={deleteTransaction.isPending}
                    >
                        {deleteTransaction.isPending ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <AddTransactionDialog open={openDialog} onClose={() => setOpenDialog(false)} />
        </Box>
    );
};

export default Transactions;
