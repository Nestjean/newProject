import React, { useState, useEffect } from 'react';

const colorOptions = [
  { name: 'Blanc', value: '#FFFFFF', textColor: '#000000' },
  { name: 'Noir', value: '#000000', textColor: '#FFFFFF' },
  { name: 'Rouge', value: '#EF4444', textColor: '#FFFFFF' },
  { name: 'Bleu', value: '#3B82F6', textColor: '#FFFFFF' },
  { name: 'Vert', value: '#10B981', textColor: '#FFFFFF' },
  { name: 'Jaune', value: '#F59E0B', textColor: '#000000' },
  { name: 'Gris', value: '#6B7280', textColor: '#FFFFFF' },
  { name: 'Argent', value: '#C0C0C0', textColor: '#000000' },
  { name: 'Bordeaux', value: '#800020', textColor: '#FFFFFF' },
  { name: 'Bleu nuit', value: '#1E3A8A', textColor: '#FFFFFF' },
];

const ColorPickerWithPreview = ({ value, onChange, label }) => {
  const [selectedColor, setSelectedColor] = useState(value || '#FFFFFF');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  useEffect(() => {
    if (value) setSelectedColor(value);
  }, [value]);

  const handleColorSelect = (colorValue) => {
    setSelectedColor(colorValue);
    onChange(colorValue);
  };

  const getColorName = (colorValue) => {
    const found = colorOptions.find(c => c.value.toUpperCase() === colorValue?.toUpperCase());
    return found ? found.name : 'Personnalisé';
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
        <div 
          className="w-16 h-16 rounded-xl shadow-md border-2 border-white"
          style={{ backgroundColor: selectedColor }}
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{getColorName(selectedColor)}</p>
          <p className="text-xs text-gray-500 font-mono">{selectedColor}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          {showCustomPicker ? 'Masquer' : 'Personnaliser'}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {colorOptions.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => handleColorSelect(color.value)}
            className={`relative group w-full aspect-square rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md ${
              selectedColor?.toUpperCase() === color.value.toUpperCase()
                ? 'ring-2 ring-blue-500 ring-offset-2 scale-105'
                : 'ring-1 ring-gray-200'
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          >
            {selectedColor?.toUpperCase() === color.value.toUpperCase() && (
              <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {showCustomPicker && (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 animate-fadeIn">
          <p className="text-xs text-gray-500 mb-2">Couleur personnalisée</p>
          <div className="flex gap-3">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="w-16 h-10 rounded cursor-pointer border border-gray-300"
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm"
              placeholder="#RRGGBB"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPickerWithPreview;