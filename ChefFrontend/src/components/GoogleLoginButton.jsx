import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function GoogleLoginButton({ onSuccess, onError }) {
  return (
    <GoogleLogin
      onSuccess={credentialResponse => {
        if (credentialResponse.credential) {
          onSuccess(credentialResponse.credential);
        } else {
          onError && onError('No credential received');
        }
      }}
      onError={() => onError && onError('Google Login Failed')}
      useOneTap
    />
  );
}
