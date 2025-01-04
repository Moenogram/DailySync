// src/components/Modal.jsx

import React from 'react';

const Modal = ({ children, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-lg p-6 w-11/12 md:w-1/3"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Schließen"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
