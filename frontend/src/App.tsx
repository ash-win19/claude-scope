import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { CSToastProvider } from '@/components/ui/CSToast';

const App = () => (
  <CSToastProvider>
    <RouterProvider router={router} />
  </CSToastProvider>
);

export default App;
