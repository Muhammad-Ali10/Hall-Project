import { useState, useEffect } from 'react';
import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const PhoneInput = ({ value, onChange, error, touched, ...props }) => {
  const [phoneValue, setPhoneValue] = useState(value || '');

  // Sync with external value changes
  useEffect(() => {
    setPhoneValue(value || '');
  }, [value]);

  const handleChange = (val) => {
    setPhoneValue(val || '');
    if (onChange) {
      onChange(val || '');
    }
  };

  return (
    <div>
      <PhoneInputWithCountry
        international
        defaultCountry="IN"
        value={phoneValue}
        onChange={handleChange}
        className={`w-full px-4 py-2 border rounded-lg ${
          error && touched ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:border-orange-500`}
        {...props}
      />
      {error && touched && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;

