import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { JSX } from 'react';

/**
 * FINAL VERSION: A centralized module for displaying consistent, professionally styled toast notifications.
 * This version features a fixed height, smooth animations, a fully functional close button,
 * and ensures only one toast is visible at a time.
 */

let activeToastId: string | null = null;

// --- Reusable Toast Component (Final Polished Design) ---
const ToastLayout = ({ t, message, icon, title }: { t: any; message: string; icon: React.ReactNode; title: string }) => (
  <div
    // These class names now correctly correspond to the animations defined in globals.css
    className={`${
      t.visible ? 'animation-toast-enter' : 'animation-toast-leave'
    } flex items-start w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-xl pointer-events-auto ring-1 ring-gray-200 dark:ring-gray-700`}
  >
    <div className="shrink-0 p-4">
      {icon}
    </div>
    <div className="flex-1 pr-4 py-3 min-w-0">
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
        {title}
      </p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
        {message}
      </p>
    </div>
    <div className="shrink-0 flex items-center p-1">
      <button
        onClick={() => toast.dismiss(t.id)}
        className="inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  </div>
);


// --- Core Toast Function ---
const showToast = (toastComponent: (t: any) => JSX.Element, options?: object) => {
  if (activeToastId) {
    toast.dismiss(activeToastId);
  }
  activeToastId = toast.custom(toastComponent, { ...options, position: 'top-center' });
};

// --- Exportable Toast Functions (with shorter duration) ---

export const toastSuccess = (message: string, title: string = "Success") => {
  showToast(
    (t) => (
      <ToastLayout
        t={t}
        title={title}
        message={message}
        icon={<CheckCircle className="h-6 w-6 text-green-500" aria-hidden="true" />}
      />
    ),
    { duration: 3000 } // Reduced duration
  );
};

export const toastError = (message: string, title: string = "Error") => {
  showToast(
    (t) => (
      <ToastLayout
        t={t}
        title={title}
        message={message}
        icon={<XCircle className="h-6 w-6 text-red-500" aria-hidden="true" />}
      />
    ),
    { duration: 4000 } // Errors can stay a bit longer
  );
};

export const toastWarning = (message: string, title: string = "Warning") => {
  showToast(
    (t) => (
      <ToastLayout
        t={t}
        title={title}
        message={message}
        icon={<AlertTriangle className="h-6 w-6 text-yellow-500" aria-hidden="true" />}
      />
    ),
    { duration: 4000 }
  );
};