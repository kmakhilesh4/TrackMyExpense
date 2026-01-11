import { Card, CardProps, styled } from '@mui/material';

const StyledCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
        opacity: 0.8,
    },
}));

const GlassCard: React.FC<CardProps> = ({ children, ...props }) => {
    return (
        <StyledCard {...props}>
            {children}
        </StyledCard>
    );
};

export default GlassCard;
