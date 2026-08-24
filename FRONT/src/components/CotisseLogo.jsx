import React from 'react';

const CotisseLogo = ({ className = "w-32 h-auto" }) => {
  return (
    <img
      src="/cotisse-logo.png"
      alt="Cotisse Transport"
      className={className}
    />
  );
};

export default CotisseLogo;