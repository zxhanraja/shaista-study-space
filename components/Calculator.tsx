

import React, { useState, useEffect } from 'react';

const Calculator: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [prevValue, setPrevValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(true);
    const [memory, setMemory] = useState(0);
    const [isMrcPressed, setIsMrcPressed] = useState(false);

    const inputDigit = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const inputDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
        } else if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (prevValue === null) {
            setPrevValue(inputValue);
        } else if (operator) {
            const currentValue = prevValue || 0;
            const newValue = calculate(currentValue, inputValue, operator);
            setPrevValue(newValue);
            setDisplay(String(newValue));
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };

    const calculate = (firstOperand: number, secondOperand: number, op: string): number => {
        switch (op) {
            case '+': return firstOperand + secondOperand;
            case '-': return firstOperand - secondOperand;
            case '*': return firstOperand * secondOperand;
            case '/': return firstOperand / secondOperand;
            case '=': return secondOperand;
            default: return secondOperand;
        }
    };
    
    const handleButtonClick = (value: string) => {
         // Clear MRC flag if another button is pressed
        if (value !== 'MRC') {
            setIsMrcPressed(false);
        }

        if (/\d/.test(value)) {
            inputDigit(value);
            return;
        }
        
        if (value === '.') {
            inputDecimal();
            return;
        }

        const inputValue = parseFloat(display);

        switch (value) {
            case '+':
            case '-':
            case '*':
            case '/':
                performOperation(value);
                break;
            case '=':
                if (operator && prevValue !== null) {
                    const newValue = calculate(prevValue, inputValue, operator);
                    setDisplay(String(newValue));
                    setPrevValue(null);
                    setOperator(null);
                    setWaitingForOperand(true);
                }
                break;
            case '%':
                const percentageValue = prevValue !== null ? (prevValue * inputValue) / 100 : inputValue / 100;
                setDisplay(String(percentageValue));
                break;
            case '+/-':
                setDisplay(String(inputValue * -1));
                break;
            case 'C':
                setDisplay('0');
                setWaitingForOperand(true);
                break;
            case 'AC':
                setDisplay('0');
                setPrevValue(null);
                setOperator(null);
                setWaitingForOperand(true);
                break;
            case 'M+':
                setMemory(prev => prev + inputValue);
                setWaitingForOperand(true);
                break;
            case 'M-':
                setMemory(prev => prev - inputValue);
                setWaitingForOperand(true);
                break;
            case 'MRC':
                if (isMrcPressed) {
                    setMemory(0);
                    setIsMrcPressed(false);
                } else {
                    setDisplay(String(memory));
                    setIsMrcPressed(true);
                    setWaitingForOperand(true);
                }
                break;
        }
    };

    const Button: React.FC<{ onClick: () => void, className?: string, children: React.ReactNode }> = ({ onClick, className, children }) => (
        <button
            onClick={onClick}
            className={`flex items-center justify-center text-lg font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:z-10 h-14 ${className}`}
        >
            {children}
        </button>
    );
    
    const getButtonClass = (btn: string) => {
        if (['/', '*', '-', '+', '='].includes(btn)) return 'bg-brand-surface-light text-brand-primary hover:bg-brand-border';
        if (['AC'].includes(btn)) return 'bg-brand-urgent/20 text-brand-urgent hover:bg-brand-urgent/40';
        if (['MRC', 'M-', 'M+'].includes(btn)) return 'bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/40';
        return 'bg-brand-surface-light text-brand-text-primary hover:bg-brand-border';
    };
    
    const buttons = [
        'MRC', 'M-', 'M+', 'AC',
        '7', '8', '9', '/',
        '4', '5', '6', '*',
        '1', '2', '3', '-',
        '0', '.', '+/-', '+',
        'C', '%', '='
    ];

    return (
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-4 md:p-6 shadow-card max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-brand-text-primary mb-4">Business Calculator</h2>
            
            <div className="bg-brand-bg text-right rounded-lg p-4 mb-4 border border-brand-border">
                <div className="text-xs text-brand-text-secondary h-5 truncate text-right">
                    {prevValue} {operator} {waitingForOperand && operator ? '' : (display !== String(prevValue) ? display : '')}
                </div>
                <div className="text-4xl font-mono text-white break-words h-12 flex items-center justify-end">
                    <span>{display}</span>
                    {memory !== 0 && <span className="text-xs font-bold text-brand-primary ml-2 absolute top-2 right-3">M</span>}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2 md:gap-3">
                {buttons.map((btn) => (
                    <Button
                        key={btn}
                        onClick={() => handleButtonClick(btn)}
                        className={`${getButtonClass(btn)} ${btn === '=' ? 'col-span-2' : ''}`}
                    >
                       {btn}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default Calculator;