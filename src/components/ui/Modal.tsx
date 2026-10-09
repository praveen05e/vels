import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 text-gray-500"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4">{children}</div>
        {actions && <div className="border-t p-4 flex justify-end space-x-2">{actions}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, isDestructive }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, isDestructive?: boolean }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} actions={<>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button variant={isDestructive ? 'danger' : 'primary'} onClick={onConfirm}>Confirm</Button>
    </>}>
      <p className="text-sm text-gray-500">{message}</p>
    </Modal>
  );
}
