import { useState } from 'react';
import { X } from 'lucide-react';

export default function Calculator({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '%':
        return firstValue % secondValue;
      default:
        return secondValue;
    }
  };

  const buttons = [
    ['C', '÷', '×', '←'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '%'],
    ['0', '.', '=']
  ];

  const handleButtonClick = (btn) => {
    if (btn >= '0' && btn <= '9') {
      inputDigit(parseInt(btn, 10));
    } else if (btn === '.') {
      inputDecimal();
    } else if (btn === 'C') {
      clear();
    } else if (btn === '←') {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
    } else if (btn === '=') {
      if (operation && previousValue !== null) {
        const inputValue = parseFloat(display);
        const newValue = calculate(previousValue, inputValue, operation);
        setDisplay(String(newValue));
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
      }
    } else {
      performOperation(btn);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-80 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-900">Calculator</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display */}
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <div className="text-right text-3xl font-bold text-white break-all">
            {display}
          </div>
          {operation && (
            <div className="text-right text-sm text-gray-400 mt-1">
              {previousValue} {operation}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          {buttons.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleButtonClick(btn)}
                  className={`flex-1 py-3 text-lg font-semibold rounded-lg transition-colors ${
                    btn === '=' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 col-span-2'
                      : ['÷', '×', '-', '+', '%'].includes(btn)
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : btn === 'C' || btn === '←'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  } ${btn === '0' ? 'flex-[2]' : ''}`}
                >
                  {btn}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
