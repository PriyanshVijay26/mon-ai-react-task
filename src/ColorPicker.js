import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  hsvToRgb,
  rgbToHsv,
  rgbToHex,
  hexToRgb,
  createSaturationGradient
} from './colorUtils';
import './ColorPicker.css';

const ColorPicker = () => {
  // Color state - using HSV for easier manipulation
  const [hue, setHue] = useState(264); // Purple hue from the screenshot
  const [saturation, setSaturation] = useState(0.65); // 65% saturation
  const [value, setValue] = useState(0.63); // 63% lightness
  
  // UI state
  const [isDraggingSaturation, setIsDraggingSaturation] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [hexInput, setHexInput] = useState('');
  const [rgbInputs, setRgbInputs] = useState({
    r: { value: '', isValid: true },
    g: { value: '', isValid: true },
    b: { value: '', isValid: true }
  });
  
  const redInput = rgbInputs.r;
  const greenInput = rgbInputs.g;
  const blueInput = rgbInputs.b;
  
  // Refs for containers
  const saturationRef = useRef(null);
  const hueRef = useRef(null);
  
  // Convert current HSV to RGB and HEX
  const rgb = hsvToRgb(hue, saturation, value);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  
  // Update input values when color changes
  useEffect(() => {
    setHexInput(hex);
    setRgbInputs({
      r: { value: rgb.r.toString(), isValid: true },
      g: { value: rgb.g.toString(), isValid: true },
      b: { value: rgb.b.toString(), isValid: true }
    });
  }, [rgb, hex]);
  
  // Handle saturation area interactions
  const handleSaturationInteraction = useCallback((clientX, clientY) => {
    if (!saturationRef.current) return;
    
    const rect = saturationRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    
    setSaturation(x);
    setValue(1 - y); // Invert Y axis for lightness
  }, []);
  
  // Handle hue bar interactions
  const handleHueInteraction = useCallback((clientX) => {
    if (!hueRef.current) return;
    
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newHue = x * 360;
    
    setHue(newHue);
  }, []);
  
  // Mouse event handlers for saturation area
  const handleSaturationMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDraggingSaturation(true);
    handleSaturationInteraction(e.clientX, e.clientY);
  }, [handleSaturationInteraction]);
  
  const handleSaturationMouseMove = useCallback((e) => {
    if (isDraggingSaturation) {
      handleSaturationInteraction(e.clientX, e.clientY);
    }
  }, [isDraggingSaturation, handleSaturationInteraction]);
  
  const handleSaturationMouseUp = useCallback(() => {
    setIsDraggingSaturation(false);
  }, []);
  
  // Mouse event handlers for hue bar
  const handleHueMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDraggingHue(true);
    handleHueInteraction(e.clientX);
  }, [handleHueInteraction]);
  
  const handleHueMouseMove = useCallback((e) => {
    if (isDraggingHue) {
      handleHueInteraction(e.clientX);
    }
  }, [isDraggingHue, handleHueInteraction]);
  
  const handleHueMouseUp = useCallback(() => {
    setIsDraggingHue(false);
  }, []);
  
  // Touch event handlers for mobile
  const handleSaturationTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDraggingSaturation(true);
    handleSaturationInteraction(touch.clientX, touch.clientY);
  }, [handleSaturationInteraction]);
  
  const handleSaturationTouchMove = useCallback((e) => {
    if (isDraggingSaturation) {
      e.preventDefault();
      const touch = e.touches[0];
      handleSaturationInteraction(touch.clientX, touch.clientY);
    }
  }, [isDraggingSaturation, handleSaturationInteraction]);
  
  const handleHueTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDraggingHue(true);
    handleHueInteraction(touch.clientX);
  }, [handleHueInteraction]);
  
  const handleHueTouchMove = useCallback((e) => {
    if (isDraggingHue) {
      e.preventDefault();
      const touch = e.touches[0];
      handleHueInteraction(touch.clientX);
    }
  }, [isDraggingHue, handleHueInteraction]);
  
  // Global mouse/touch end handlers
  useEffect(() => {
    const handleEnd = () => {
      setIsDraggingSaturation(false);
      setIsDraggingHue(false);
    };
    
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
    
    return () => {
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, []);
  
  // Input change handlers
  const handleHexChange = useCallback((e) => {
    const newHex = e.target.value;
    setHexInput(newHex);
    
    if (/^#[0-9A-Fa-f]{6}$/.test(newHex)) {
      const newRgb = hexToRgb(newHex);
      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setHue(newHsv.h);
      setSaturation(newHsv.s);
      setValue(newHsv.v);
    }
  }, []);
  
  const handleRgbChange = useCallback((component, e) => {
    const newValue = e.target.value;
    
    setRgbInputs(prev => ({
      ...prev,
      [component]: { 
        value: newValue, 
        isValid: !isNaN(newValue) && newValue >= 0 && newValue <= 255 
      }
    }));
    
    if (!isNaN(newValue) && newValue >= 0 && newValue <= 255) {
      const newRgb = { ...rgb, [component]: parseInt(newValue) };
      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setHue(newHsv.h);
      setSaturation(newHsv.s);
      setValue(newHsv.v);
    }
  }, [rgb]);
  
  // Calculate cursor positions
  const saturationCursorX = saturation * 100;
  const saturationCursorY = (1 - value) * 100;
  const hueCursorX = (hue / 360) * 100;
  
  return (
    <div className="color-picker">
      <div className="color-picker-container">
        {/* Saturation/Lightness Area */}
        <div className="saturation-area">
          <div
            ref={saturationRef}
            className="saturation-gradient"
            style={{ background: createSaturationGradient(hue) }}
            onMouseDown={handleSaturationMouseDown}
            onMouseMove={handleSaturationMouseMove}
            onTouchStart={handleSaturationTouchStart}
            onTouchMove={handleSaturationTouchMove}
          >
            <div
              className="saturation-cursor"
              style={{
                left: `${saturationCursorX}%`,
                top: `${saturationCursorY}%`,
                backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
              }}
            />
          </div>
        </div>
        
        {/* Hue Bar */}
        <div className="hue-area">
          <div
            ref={hueRef}
            className="hue-gradient"
            onMouseDown={handleHueMouseDown}
            onMouseMove={handleHueMouseMove}
            onTouchStart={handleHueTouchStart}
            onTouchMove={handleHueTouchMove}
          >
            <div
              className="hue-cursor"
              style={{ left: `${hueCursorX}%` }}
            />
          </div>
        </div>
        
        {/* Color Inputs */}
        <div className="color-inputs">
          <div className="input-group hex-group">
            <label>HEX</label>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              placeholder="#000000"
              maxLength={7}
            />
          </div>
          
          <div className="input-group rgb-group">
            <div className="rgb-inputs">
              <div className="rgb-input">
                <label>R</label>
                <input
                  type="number"
                  value={redInput.value}
                  onChange={(e) => handleRgbChange('r', e)}
                  min="0"
                  max="255"
                />
              </div>
              <div className="rgb-input">
                <label>G</label>
                <input
                  type="number"
                  value={greenInput.value}
                  onChange={(e) => handleRgbChange('g', e)}
                  min="0"
                  max="255"
                />
              </div>
              <div className="rgb-input">
                <label>B</label>
                <input
                  type="number"
                  value={blueInput.value}
                  onChange={(e) => handleRgbChange('b', e)}
                  min="0"
                  max="255"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Color Preview */}
        <div className="color-preview">
          <div 
            className="preview-swatch"
            style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
