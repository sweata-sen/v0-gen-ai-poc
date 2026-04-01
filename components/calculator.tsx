'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DeleteIcon, RotateCcw } from 'lucide-react'

interface CalculatorMemory {
  value: number
  operation: string | null
  displayValue: string
  previousValue: string | null
  isNewNumber: boolean
  isDegrees: boolean
}

const TRIG_FUNCTIONS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
}

export function Calculator() {
  const [displayValue, setDisplayValue] = useState('0')
  const [previousValue, setPreviousValue] = useState<string | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [isNewNumber, setIsNewNumber] = useState(true)
  const [isDegrees, setIsDegrees] = useState(true)
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key
      const code = event.code

      // Number keys and decimal point
      if (/^[0-9]$/.test(key)) {
        event.preventDefault()
        handleNumberClick(key)
      } else if (key === '.') {
        event.preventDefault()
        handleNumberClick('.')
      }
      // Operations
      else if (key === '+') {
        event.preventDefault()
        handleOperation('+')
      } else if (key === '-' && !event.shiftKey) {
        event.preventDefault()
        handleOperation('-')
      } else if (key === '*' || key === 'x' || key === 'X') {
        event.preventDefault()
        handleOperation('*')
      } else if (key === '/') {
        event.preventDefault()
        handleOperation('/')
      } else if (key === '%') {
        event.preventDefault()
        handleOperation('%')
      } else if (key === '^') {
        event.preventDefault()
        handleOperation('^')
      }
      // Enter or = for equals
      else if (key === 'Enter' || key === '=') {
        event.preventDefault()
        handleEquals()
      }
      // Backspace for delete
      else if (key === 'Backspace') {
        event.preventDefault()
        handleBackspace()
      }
      // Escape for clear
      else if (key === 'Escape') {
        event.preventDefault()
        handleClear()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [displayValue, previousValue, operation, isNewNumber])

  // Format number to avoid floating point errors
  const formatNumber = (num: number): string => {
    if (isNaN(num)) return 'Error'
    if (!isFinite(num)) return 'Infinity'
    // Round to 10 decimal places to avoid floating point errors
    const rounded = Math.round(num * 1e10) / 1e10
    return rounded.toString()
  }

  // Convert degrees to radians if necessary
  const toRadians = (degrees: number): number => {
    return isDegrees ? (degrees * Math.PI) / 180 : degrees
  }

  // Convert radians to degrees if necessary
  const toDegrees = (radians: number): number => {
    return isDegrees ? (radians * 180) / Math.PI : radians
  }

  // Evaluate mathematical expression with BODMAS
  const evaluateExpression = (expr: string): number => {
    try {
      // Remove spaces
      expr = expr.replace(/\s/g, '')

      // Replace trigonometric functions
      expr = expr.replace(/sin\(/g, 'Math.sin(')
      expr = expr.replace(/cos\(/g, 'Math.cos(')
      expr = expr.replace(/tan\(/g, 'Math.tan(')
      expr = expr.replace(/asin\(/g, 'Math.asin(')
      expr = expr.replace(/acos\(/g, 'Math.acos(')
      expr = expr.replace(/atan\(/g, 'Math.atan(')
      expr = expr.replace(/sinh\(/g, 'Math.sinh(')
      expr = expr.replace(/cosh\(/g, 'Math.cosh(')
      expr = expr.replace(/tanh\(/g, 'Math.tanh(')

      // Replace other Math functions
      expr = expr.replace(/√/g, 'Math.sqrt(')
      expr = expr.replace(/log\(/g, 'Math.log10(')
      expr = expr.replace(/ln\(/g, 'Math.log(')
      expr = expr.replace(/π/g, Math.PI.toString())
      expr = expr.replace(/e\b/g, Math.E.toString())
      expr = expr.replace(/\^/g, '**')

      // Create custom Math object with trigonometric functions that handle degree/radian conversion
      const customMath = {
        ...Math,
        sin: (x: number) => Math.sin(toRadians(x)),
        cos: (x: number) => Math.cos(toRadians(x)),
        tan: (x: number) => Math.tan(toRadians(x)),
        asin: (x: number) => toDegrees(Math.asin(x)),
        acos: (x: number) => toDegrees(Math.acos(x)),
        atan: (x: number) => toDegrees(Math.atan(x)),
      }

      // Use Function constructor to evaluate with custom Math object
      const result = Function('"use strict"; const Math = arguments[0]; return (' + expr + ')')( customMath)
      return result
    } catch (e) {
      return NaN
    }
  }

  const handleNumberClick = (num: string) => {
    if (isNewNumber) {
      setDisplayValue(num === '.' ? '0.' : num)
      setIsNewNumber(num === '.')
    } else {
      if (num === '.') {
        if (!displayValue.includes('.')) {
          setDisplayValue(displayValue + num)
        }
      } else {
        setDisplayValue(displayValue === '0' ? num : displayValue + num)
      }
    }
  }

  const handleOperation = (op: string) => {
    const currentValue = displayValue

    if (previousValue !== null && operation && !isNewNumber) {
      // Calculate the result of the previous operation
      const prev = previousValue
      const current = currentValue
      const result = evaluateExpression(`${prev}${operation}${current}`)

      if (!isNaN(result)) {
        const formatted = formatNumber(result)
        setDisplayValue(formatted)
        setPreviousValue(formatted)
      }
    } else {
      setPreviousValue(currentValue)
    }

    setOperation(op)
    setIsNewNumber(true)
  }

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const result = evaluateExpression(`${previousValue}${operation}${displayValue}`)

      if (!isNaN(result)) {
        const formatted = formatNumber(result)
        setHistory([...history, `${previousValue}${operation}${displayValue}=${formatted}`])
        setDisplayValue(formatted)
        setPreviousValue(null)
        setOperation(null)
        setIsNewNumber(true)
      }
    }
  }

  const handleClear = () => {
    setDisplayValue('0')
    setPreviousValue(null)
    setOperation(null)
    setIsNewNumber(true)
  }

  const handleBackspace = () => {
    if (displayValue.length === 1) {
      setDisplayValue('0')
      setIsNewNumber(true)
    } else {
      setDisplayValue(displayValue.slice(0, -1))
    }
  }

  const handleTrigFunction = (func: string) => {
    const value = parseFloat(displayValue)
    if (!isNaN(value)) {
      const radianValue = isDegrees ? toRadians(value) : value
      const result = (TRIG_FUNCTIONS[func as keyof typeof TRIG_FUNCTIONS]?.(radianValue) ?? 0)
      const finalResult = func.startsWith('a') ? toDegrees(result) : result
      const formatted = formatNumber(finalResult)
      setDisplayValue(formatted)
      setIsNewNumber(true)
    }
  }

  const handleFunction = (func: string) => {
    const value = parseFloat(displayValue)
    if (isNaN(value)) return

    let result: number
    switch (func) {
      case 'sqrt':
        result = Math.sqrt(value)
        break
      case 'square':
        result = value * value
        break
      case 'reciprocal':
        result = 1 / value
        break
      case 'percent':
        result = value / 100
        break
      case 'negate':
        result = -value
        break
      case 'log':
        result = Math.log10(value)
        break
      case 'ln':
        result = Math.log(value)
        break
      case 'factorial':
        if (value < 0 || value !== Math.floor(value)) {
          result = NaN
        } else {
          result = 1
          for (let i = 2; i <= value; i++) {
            result *= i
          }
        }
        break
      default:
        result = NaN
    }

    if (!isNaN(result) && isFinite(result)) {
      const formatted = formatNumber(result)
      setDisplayValue(formatted)
      setIsNewNumber(true)
    }
  }

  return (
    <div className="w-full max-w-md" ref={containerRef}>
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-700">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-cyan-400 text-2xl font-bold text-center">Scientific Calculator</h1>
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => setIsDegrees(true)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                isDegrees
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Deg
            </button>
            <button
              onClick={() => setIsDegrees(false)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                !isDegrees
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Rad
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="bg-gradient-to-b from-slate-950 to-slate-900 rounded-xl p-4 mb-6 border border-slate-700">
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            readOnly
            className="w-full bg-transparent text-right text-4xl font-bold text-cyan-400 outline-none overflow-hidden"
          />
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {/* Row 1: Clear and Functions */}
          <Button
            onClick={handleClear}
            className="col-span-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg h-12"
          >
            Clear
          </Button>
          <Button
            onClick={handleBackspace}
            className="bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg h-12"
          >
            <DeleteIcon className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => handleOperation('/')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg h-12"
          >
            ÷
          </Button>

          {/* Row 2: Trig Functions */}
          <Button
            onClick={() => handleTrigFunction('sin')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12"
          >
            sin
          </Button>
          <Button
            onClick={() => handleTrigFunction('cos')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12"
          >
            cos
          </Button>
          <Button
            onClick={() => handleTrigFunction('tan')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12"
          >
            tan
          </Button>
          <Button
            onClick={() => handleOperation('*')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg h-12"
          >
            ×
          </Button>

          {/* Row 3: More Trig Functions */}
          <Button
            onClick={() => handleTrigFunction('asin')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12 text-xs"
          >
            asin
          </Button>
          <Button
            onClick={() => handleTrigFunction('acos')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12 text-xs"
          >
            acos
          </Button>
          <Button
            onClick={() => handleTrigFunction('atan')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12 text-xs"
          >
            atan
          </Button>
          <Button
            onClick={() => handleOperation('-')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg h-12"
          >
            −
          </Button>

          {/* Row 4: Functions */}
          <Button
            onClick={() => handleFunction('sqrt')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12"
          >
            √
          </Button>
          <Button
            onClick={() => handleFunction('square')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12"
          >
            x²
          </Button>
          <Button
            onClick={() => handleFunction('reciprocal')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12 text-xs"
          >
            1/x
          </Button>
          <Button
            onClick={() => handleOperation('+')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg h-12"
          >
            +
          </Button>

          {/* Row 5: More Functions */}
          <Button
            onClick={() => handleFunction('log')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12"
          >
            log
          </Button>
          <Button
            onClick={() => handleFunction('ln')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12"
          >
            ln
          </Button>
          <Button
            onClick={() => handleFunction('factorial')}
            className="bg-slate-700 hover:bg-slate-600 text-cyan-400 font-bold rounded-lg h-12"
          >
            n!
          </Button>
          <Button
            onClick={() => handleOperation('%')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg h-12"
          >
            %
          </Button>

          {/* Number Pad and Operations */}
          <Button
            onClick={() => handleNumberClick('7')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg h-12"
          >
            7
          </Button>
          <Button
            onClick={() => handleNumberClick('8')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg h-12"
          >
            8
          </Button>
          <Button
            onClick={() => handleNumberClick('9')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg h-12"
          >
            9
          </Button>
          <Button
            onClick={() => handleOperation('^')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg h-12"
          >
            x^y
          </Button>

          <Button
            onClick={() => handleNumberClick('4')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg h-12"
          >
            4
          </Button>
          <Button
            onClick={() => handleNumberClick('5')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg h-12"
          >
            5
          </Button>
          <Button
            onClick={() => handleNumberClick('6')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg h-12"
          >
            6
          </Button>
          <Button
            onClick={() => handleFunction('negate')}
            className="bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg h-12"
          >
            ±
          </Button>

          <Button
            onClick={() => handleNumberClick('1')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg h-12"
          >
            1
          </Button>
          <Button
            onClick={() => handleNumberClick('2')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg h-12"
          >
            2
          </Button>
          <Button
            onClick={() => handleNumberClick('3')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg h-12"
          >
            3
          </Button>
          <Button
            onClick={handleEquals}
            className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg h-12 row-span-2"
          >
            =
          </Button>

          <Button
            onClick={() => handleNumberClick('0')}
            className="col-span-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg h-12"
          >
            0
          </Button>
          <Button
            onClick={() => handleNumberClick('.')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg h-12"
          >
            .
          </Button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-slate-950 rounded-lg p-3 border border-slate-700 max-h-24 overflow-y-auto">
            <p className="text-slate-400 text-xs font-bold mb-2">History</p>
            <div className="space-y-1">
              {history.slice(-3).map((item, idx) => (
                <p key={idx} className="text-cyan-400 text-xs font-mono">
                  {item}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
