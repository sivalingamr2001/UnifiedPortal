import React from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Edit, Trash2 } from "lucide-react";

// Re-export existing components from their files
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";

// SectionHeading
export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}
export const SectionHeading: React.FC<SectionHeadingProps> = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between gap-4 mb-4">
    <div className="flex items-center gap-3">
      <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
      {subtitle && (
        <span className="text-[10px] font-mono text-slate-600 font-semibold border border-slate-300 bg-slate-50 px-1.5 py-0.5 rounded">
          {subtitle}
        </span>
      )}
    </div>
    {action && <div className="flex items-center gap-2">{action}</div>}
  </div>
);

// PrimaryButton
export const PrimaryButton: React.FC<React.ComponentProps<typeof Button>> = (props) => (
  <Button
    {...props}
    className={`bg-blue-700 hover:bg-blue-800 text-white font-semibold text-[11px] px-3 py-1.5 rounded transition-colors shadow-sm cursor-pointer ${props.className || ""}`}
  />
);

// SecondaryButton
export const SecondaryButton: React.FC<React.ComponentProps<typeof Button>> = (props) => (
  <Button
    variant="outline"
    {...props}
    className={`border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] px-3 py-1.5 rounded transition-colors shadow-sm cursor-pointer ${props.className || ""}`}
  />
);

// Modal
export interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}
export const Modal: React.FC<ModalProps> = ({ title, onClose, children, footer, wide }) => (
  <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className={`${wide ? "sm:max-w-[700px]" : "sm:max-w-[450px]"} bg-white rounded-lg shadow-lg border border-slate-200`}>
      <DialogHeader className="border-b border-slate-100 pb-2">
        <DialogTitle className="text-sm font-bold text-slate-900">{title}</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
        {children}
      </div>
      {footer && (
        <DialogFooter className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2">
          {footer}
        </DialogFooter>
      )}
    </DialogContent>
  </Dialog>
);

// Field
export interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}
export const Field: React.FC<FieldProps> = ({ label, required, error, hint, children }) => (
  <div className="flex flex-col gap-1 mb-3">
    <label className="text-[11px] font-bold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <span className="text-[10px] text-red-500 font-medium mt-0.5">{error}</span>}
    {hint && !error && <span className="text-[9px] text-slate-400 font-medium mt-0.5">{hint}</span>}
  </div>
);

// fieldInputCls
export const fieldInputCls = (hasError?: boolean | string) =>
  `bg-white border ${
    hasError ? "border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
  } rounded px-2.5 py-1.5 text-[11px] text-slate-800 placeholder:text-slate-400 font-medium w-full focus:outline-none focus:ring-2 transition-all`;

// inputCls
export const inputCls =
  "bg-white border border-slate-300 rounded px-2.5 py-1.5 text-[11px] text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all";

// RoleBadge
export const RoleBadge: React.FC<{ role?: string; children?: React.ReactNode }> = ({ role, children }) => {
  const val = role || children;
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-50 text-violet-700 border border-violet-200 uppercase tracking-wider">
      {val}
    </span>
  );
};

// StatusPill
export const StatusPill: React.FC<{ status?: string }> = ({ status }) => {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
        isActive ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300" : "bg-slate-100 text-slate-600 ring-1 ring-slate-300"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

// Code
export const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-800">
    {children}
  </code>
);

// IconAction
export interface IconActionProps {
  label: string;
  onClick: () => void;
  danger?: boolean;
}
export const IconAction: React.FC<IconActionProps> = ({ label, onClick, danger }) => {
  const isDelete = label.toLowerCase() === "delete" || danger;
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center mr-1 ${
        isDelete ? "text-slate-400 hover:text-red-600" : "text-slate-400 hover:text-blue-700"
      }`}
    >
      {isDelete ? <Trash2 className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
    </button>
  );
};

// LoadingRow
export const LoadingRow: React.FC<{ colSpan: number }> = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-8 text-slate-500 font-medium">
      Loading...
    </td>
  </tr>
);

// EmptyRow
export const EmptyRow: React.FC<{ colSpan: number }> = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-8 text-slate-500 font-medium">
      No records found.
    </td>
  </tr>
);
