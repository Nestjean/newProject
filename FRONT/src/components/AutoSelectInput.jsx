import React from 'react';

const AutoSelectInput = ({ value, onChange, placeholder, className, ...props }) => {
  const handleFocus = (e) => {
    e.target.select();
  };

  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={`w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${className}`}
      {...props}
    />
  );
};

export default AutoSelectInput;