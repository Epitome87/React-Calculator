import { useReducer } from 'react';
import DigitButton from './DigitButton';
import OperationButton from './OperationButton';
import './Calculator.css';

export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  DELETE_DIGIT: 'delete-digit',
  CLEAR: 'clear',
  CHOOSE_OPERATION: 'choose-operation',
  EVALUATE: 'evaluate',
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite)
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        };
      if (payload.digit === '0' && state.currentOperand === '0') return state;
      if (payload.digit === '.' && state.currentOperand.includes('.'))
        return state;

      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${payload.digit}`,
      };

    case ACTIONS.CHOOSE_OPERATION:
      // No previous or current operands
      if (state.currentOperand === null && state.previousOperand == null)
        return state;

      // Override previous operation
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        };
      }
      // No previous operand, but is a current one
      if (state.previousOperand == null)
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      };

    case ACTIONS.EVALUATE:
      // Do we have all 3 relevant pieces of state required to evaluate?
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      )
        return state;

      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        currentOperand: evaluate(state),
        operation: null,
      };

    case ACTIONS.DELETE_DIGIT:
      // Did we just evaluate? Delete entire currentOperand
      if (state.overwrite)
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        };

      // If no currente operand, nothing to delete!
      if (state.currentOperand == null) return state;

      // Only 1 digit left? Set currentOperand to null rather than making it an empty string
      if (state.currentOperand === 1)
        return {
          ...state,
          currentOperand: null,
        };

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };

    case ACTIONS.CLEAR:
      // Return empty state
      return { currentOperand: '0' };

    default:
      return state;
  }
};

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);

  if (isNaN(prev) || isNaN(current)) return '';

  let computation = '';

  switch (operation) {
    case '+':
      computation = prev + current;
      break;
    case '-':
      computation = prev - current;
      break;
    case '/':
      computation = prev / current;
      break;
    case '*':
      computation = prev * current;
      break;
    default:
      return computation.toString();
  }

  return computation.toString();
}

const INTEGER_FORMATTER = new Intl.NumberFormat('en-us', {
  maximumFractionDigits: 0,
});

function formatOperand(operand) {
  if (operand == null) return;
  const [integer, decimal] = operand.split('.');
  if (decimal == null) return INTEGER_FORMATTER.format(integer);
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`;
}

const Calculator = () => {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    { currentOperand: '0' }
  );

  return (
    <div className='calculator-grid'>
      <div className='output'>
        <div className='previous-operand'>
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className='current-operand'>{formatOperand(currentOperand)}</div>
      </div>
      <button
        className='span-two'
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}
      >
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
        DEL
      </button>
      <OperationButton operation='/' dispatch={dispatch}>
        ÷
      </OperationButton>
      <DigitButton digit='1' dispatch={dispatch}>
        1
      </DigitButton>
      <DigitButton digit='2' dispatch={dispatch}>
        2
      </DigitButton>
      <DigitButton digit='3' dispatch={dispatch}>
        3
      </DigitButton>
      <OperationButton operation='*' dispatch={dispatch}>
        *
      </OperationButton>
      <DigitButton digit='4' dispatch={dispatch}>
        4
      </DigitButton>
      <DigitButton digit='5' dispatch={dispatch}>
        5
      </DigitButton>
      <DigitButton digit='6' dispatch={dispatch}>
        6
      </DigitButton>
      <OperationButton operation='+' dispatch={dispatch}>
        +
      </OperationButton>
      <DigitButton digit='7' dispatch={dispatch}>
        7
      </DigitButton>
      <DigitButton digit='8' dispatch={dispatch}>
        8
      </DigitButton>
      <DigitButton digit='9' dispatch={dispatch}>
        9
      </DigitButton>
      <OperationButton operation='-' dispatch={dispatch}>
        -
      </OperationButton>
      <DigitButton digit='.' dispatch={dispatch}>
        .
      </DigitButton>
      <DigitButton digit='0' dispatch={dispatch}>
        0
      </DigitButton>
      <button
        className='span-two'
        onClick={() => {
          dispatch({ type: ACTIONS.EVALUATE });
        }}
      >
        =
      </button>
    </div>
  );
};

export default Calculator;
