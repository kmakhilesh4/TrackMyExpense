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
    Box,
    CircularProgress,
    Grid,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import { toast } from 'react-hot-toast';

interface AddCategoryDialogProps {
    open: boolean;
    onClose: () => void;
}

const CATEGORY_ICONS = ['🍔', '🚗', '🏠', '💡', '🎬', '🏥', '📚', '✈️', '🛒', '💰', '📱', '👕', '🎮', '☕', '🍕'];
const CATEGORY_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const AddCategoryDialog = ({ open, onClose }: AddCategoryDialogProps) => {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        type: 'expense' as 'expense' | 'income',
        icon: '🍔',
        color: '#ef4444',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const createCategory = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/categories', data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create category');
        },
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await createCategory.mutateAsync({
                name: formData.name,
                type: formData.type,
                icon: formData.icon,
                color: formData.color,
                isDefault: false,
            });
            handleClose();
        } catch (error) {
            console.error('Failed to create category:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            type: 'expense',
            icon: '🍔',
            color: '#ef4444',
        });
        onClose();
    };

    const isValid = formData.name && formData.type && formData.icon && formData.color;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="Category Name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., Groceries, Rent, Salary"
                    />

                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={formData.type}
                            label="Type"
                            onChange={(e) => handleChange('type', e.target.value)}
                        >
                            <MenuItem value="expense">Expense</MenuItem>
                            <MenuItem value="income">Income</MenuItem>
                        </Select>
                    </FormControl>

                    <Box>
                        <InputLabel sx={{ mb: 1 }}>Icon</InputLabel>
                        <Grid container spacing={1}>
                            {CATEGORY_ICONS.map((icon) => (
                                <Grid item key={icon}>
                                    <Button
                                        variant={formData.icon === icon ? 'contained' : 'outlined'}
                                        onClick={() => handleChange('icon', icon)}
                                        sx={{
                                            minWidth: 50,
                                            height: 50,
                                            fontSize: '1.5rem',
                                        }}
                                    >
                                        {icon}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Box>
                        <InputLabel sx={{ mb: 1 }}>Color</InputLabel>
                        <Grid container spacing={1}>
                            {CATEGORY_COLORS.map((color) => (
                                <Grid item key={color}>
                                    <Button
                                        variant={formData.color === color ? 'contained' : 'outlined'}
                                        onClick={() => handleChange('color', color)}
                                        sx={{
                                            minWidth: 50,
                                            height: 50,
                                            bgcolor: color,
                                            '&:hover': {
                                                bgcolor: color,
                                                opacity: 0.8,
                                            },
                                            border: formData.color === color ? '3px solid white' : '1px solid rgba(0,0,0,0.23)',
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
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
                    {isSubmitting ? <CircularProgress size={24} /> : 'Add Category'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddCategoryDialog;
