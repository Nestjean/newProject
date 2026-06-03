import React from 'react';

const CotisseLogo = ({ className = "w-8 h-8" }) => {
  return (
    <img 
      src="/cotisse-logo.png" 
      alt="Cotisse" 
      className={`${className} object-cover rounded-full`}
    />
  );
};

export default CotisseLogo;