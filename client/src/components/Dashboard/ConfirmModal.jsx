import { AlertTriangle, X, Loader2, Info } from "lucide-react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={isLoading ? undefined : onClose} />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex shrink-0 h-12 w-12 items-center justify-center rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'}`}>
              {isDanger ? <AlertTriangle className="h-6 w-6" strokeWidth={2} /> : <Info className="h-6 w-6" strokeWidth={2} />}
            </div>
            
            <div className="pt-1">
              <h3 className="text-lg font-bold text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200' : 'bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-200'}`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
