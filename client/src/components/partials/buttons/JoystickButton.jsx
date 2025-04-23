import React, { useState } from 'react';

const JoystickButton = ({
  checked = false,
  onChange,
  disabled = false,
  label = '',
  mode = 'toggle',
}) => {
  const [triggered, setTriggered] = useState(false);

  const handleClick = (e) => {
    if (disabled) return;

    if (mode === 'trigger') {
      setTriggered(true);
      onChange?.(e);
      setTimeout(() => setTriggered(false), 300);
    } else {
      onChange?.({ target: { checked: !checked } });
    }
  };

  const isActive = mode === 'trigger' ? triggered : checked;

  return (
    <div className="flex flex-row justify-evenly items-center px-1">
      <div className="toggle w-[70px] scale-75">
        <input
          className="toggle-input"
          type="checkbox"
          checked={isActive}
          onChange={handleClick}
          disabled={disabled}
        />
        <div className="toggle-handle-wrapper">
          <div className="toggle-handle">
            <div className="toggle-handle-knob"></div>
            <div className="toggle-handle-bar-wrapper">
              <div className="toggle-handle-bar"></div>
            </div>
          </div>
        </div>
        <div className="toggle-base">
          <div className="toggle-base-inside"></div>
        </div>
      </div>
      {label && (
        <p className="relative z-[5] font-roboto text-sm font-medium">
          {label}
        </p>
      )}
    </div>
  );
};

export default JoystickButton;
