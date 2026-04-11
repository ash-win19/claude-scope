import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { CSToastProvider } from '@/components/ui/CSToast';
import { Auth0ProviderWithNavigate } from '@/auth/Auth0ProviderWithNavigate';
import { AuthCallback } from '@/auth/AuthCallback';

const App = () => (
  <Auth0ProviderWithNavigate>
    <AuthCallback>
      <CSToastProvider>
        <RouterProvider router={router} />
      </CSToastProvider>
    </AuthCallback>
  </Auth0ProviderWithNavigate>
);

export default App;
