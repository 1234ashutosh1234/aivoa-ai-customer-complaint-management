import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeConfirmModal } from '../../store/slices/uiSlice';
import Button from './Button';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({ 
  isOpen: propIsOpen, 
  onClose: propOnClose, 
  onConfirm: propOnConfirm,
  title: propTitle,
  children,
  message: propMessage,
  confirmText: propConfirmText,
  cancelText: propCancelText = 'Cancel',
  isDanger: propIsDanger = false,
  loading = false
}) => {
  const reduxModal = useSelector((state) => state.ui?.confirmModal || {});
  const dispatch = useDispatch();

  const isOpen = propIsOpen !== undefined ? propIsOpen : reduxModal.isOpen;
  const title = propTitle || reduxModal.title || 'Confirm Action';
  const message = propMessage || reduxModal.message;
  const confirmText = propConfirmText || reduxModal.confirmText || 'Confirm';
  const cancelText = propCancelText || reduxModal.cancelText || 'Cancel';
  const isDanger = propIsDanger || reduxModal.isDanger;

  if (!isOpen) return null;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      dispatch(closeConfirmModal());
    }
  };

  const handleConfirm = (e) => {
    if (propOnConfirm) {
      propOnConfirm(e);
    } else {
      dispatch(closeConfirmModal());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-full ${
                isDanger ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4">
          {message && <p className="text-sm text-slate-600 leading-relaxed mb-4">{message}</p>}
          {children}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
          <Button type="button" variant="secondary" size="md" onClick={handleClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button 
            type="button" 
            variant={isDanger ? 'danger' : 'primary'} 
            size="md" 
            onClick={handleConfirm}
            isLoading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
