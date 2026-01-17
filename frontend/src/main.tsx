import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';
import './index.css';

// Configure Amplify
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
            userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
            signUpVerificationMethod: 'code',
            loginWith: {
                email: true,
            }
        }
    },
    Storage: {
        S3: {
            bucket: import.meta.env.VITE_S3_RECEIPTS_BUCKET,
            region: import.meta.env.VITE_AWS_REGION || 'ap-south-1',
        }
    }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
