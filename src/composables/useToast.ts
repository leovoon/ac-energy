import { toast } from 'vue-sonner';

export function useToast() {
  return {
    /**
     * Show a success toast notification
     */
    success: (message: string) => {
      toast.success(message);
    },
    
    /**
     * Show an error toast notification
     */
    error: (message: string) => {
      toast.error(message);
    },
    
    /**
     * Show an info toast notification
     */
    info: (message: string) => {
      toast.info(message);
    },
    
    /**
     * Show a warning toast notification
     */
    warning: (message: string) => {
      toast.warning(message);
    },
    
    /**
     * Show a custom toast notification
     */
    custom: (options: any) => {
      toast(options);
    },
    
    /**
     * Show a promise toast notification
     */
    promise: <T>(promise: Promise<T>, options: any) => {
      return toast.promise(promise, options);
    }
  };
}