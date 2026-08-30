import React, { createContext, useContext, useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<{ resolve: (val: boolean) => void } | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolveRef({ resolve });
      setOpen(true);
    });
  };

  const handleCancel = () => {
    setOpen(false);
    resolveRef?.resolve(false);
  };

  const handleConfirm = () => {
    setOpen(false);
    resolveRef?.resolve(true);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && options && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent className="bg-white rounded-lg shadow-lg border border-slate-200 text-xs">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-sm font-bold text-slate-900">{options.title}</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-500 mt-1">
                {options.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 gap-2">
              <AlertDialogCancel onClick={handleCancel} className="text-xs cursor-pointer border border-slate-200 hover:bg-slate-50">
                {options.cancelLabel || 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                className={`text-xs cursor-pointer text-white font-semibold ${
                  options.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                {options.confirmLabel || 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
