import React from 'react';
import ReactDOM from 'react-dom';
import theme from '../theme';

function ConfirmationPopup({ message, onClose }) {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className={`bg-[${theme.common.white}] p-4 rounded shadow-lg max-w-sm w-full text-center`}>
        <p className={`mb-4 text-[${theme.common.black}]`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`px-4 py-2 bg-[${theme.common.brown}] text-[${theme.common.white}] rounded hover:opacity-80`}
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmationPopup;