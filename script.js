const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const calculator = document.querySelector(".calculator");
let displayValue = "0";
let firstOperand = null;
let activeOperation = null;
let shouldReplaceDisplay = false;

function updateDisplay() {
  display.textContent = displayValue;
  calculator.querySelectorAll("[data-action='operator']").forEach((button) => {
    button.classList.toggle(
      "is-selected",
      button.dataset.value === activeOperation && shouldReplaceDisplay,
    );
  });
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }
  return String(Number(value.toFixed(8)));
}

function calculate(left, right, operation) {
  if (operation === "+") {
    return left + right;
  }
  if (operation === "−") {
    return left - right;
  }
  if (operation === "×") {
    return left * right;
  }
  if (operation === "÷") {
    if (right === 0) {
      return null;
    }
    return left / right;
  }
  return right;
}

function enterDigit(digit) {
  displayValue =
    shouldReplaceDisplay || displayValue === "0" || displayValue === "Error"
      ? digit
      : `${displayValue}${digit}`;
  shouldReplaceDisplay = false;
  expression.textContent = "";
  updateDisplay();
}

function enterDecimal() {
  if (shouldReplaceDisplay || displayValue === "Error") {
    displayValue = "0.";
    shouldReplaceDisplay = false;
  } else if (!displayValue.includes(".")) {
    displayValue += ".";
  }
  updateDisplay();
}

function chooseOperation(operation) {
  const currentValue = Number(displayValue);

  if (activeOperation && !shouldReplaceDisplay && firstOperand !== null) {
    const result = calculate(firstOperand, currentValue, activeOperation);
    if (result === null) {
      showError("Cannot divide by zero");
      return;
    }
    displayValue = formatNumber(result);
    firstOperand = Number(displayValue);
  } else if (firstOperand === null || !shouldReplaceDisplay) {
    firstOperand = currentValue;
  }

  activeOperation = operation;
  shouldReplaceDisplay = true;
  expression.textContent = `${formatNumber(firstOperand)} ${operation}`;
  updateDisplay();
}

function showError(message) {
  displayValue = "Error";
  expression.textContent = message;
  firstOperand = null;
  activeOperation = null;
  shouldReplaceDisplay = true;
  updateDisplay();
}

function showResult() {
  if (!activeOperation || firstOperand === null) {
    return;
  }

  const result = calculate(firstOperand, Number(displayValue), activeOperation);
  if (result === null) {
    showError("Cannot divide by zero");
    return;
  }

  expression.textContent = `${formatNumber(firstOperand)} ${activeOperation} ${displayValue} =`;
  displayValue = formatNumber(result);
  firstOperand = null;
  activeOperation = null;
  shouldReplaceDisplay = true;
  updateDisplay();
}

function clearCalculator() {
  displayValue = "0";
  firstOperand = null;
  activeOperation = null;
  shouldReplaceDisplay = false;
  expression.textContent = "";
  updateDisplay();
}

function handleAction(action, value) {
  if (action === "number") {
    enterDigit(value);
  } else if (action === "decimal") {
    enterDecimal();
  } else if (action === "operator") {
    chooseOperation(value);
  } else if (action === "equals") {
    showResult();
  } else if (action === "clear") {
    clearCalculator();
  } else if (action === "sign" && displayValue !== "0" && displayValue !== "Error") {
    displayValue = formatNumber(Number(displayValue) * -1);
    updateDisplay();
  } else if (action === "percent" && displayValue !== "Error") {
    displayValue = formatNumber(Number(displayValue) / 100);
    updateDisplay();
  } else if (action === "delete" && !shouldReplaceDisplay) {
    displayValue =
      displayValue.length <= 1 || (displayValue.length === 2 && displayValue.startsWith("-"))
        ? "0"
        : displayValue.slice(0, -1);
    updateDisplay();
  }
}

calculator.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button[data-action]");
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  handleAction(button.dataset.action, button.dataset.value);
});

window.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) {
    enterDigit(event.key);
  } else if (event.key === ".") {
    enterDecimal();
  } else if (["+", "-"].includes(event.key)) {
    chooseOperation(event.key === "-" ? "−" : event.key);
  } else if (event.key === "*") {
    chooseOperation("×");
  } else if (event.key === "/") {
    event.preventDefault();
    chooseOperation("÷");
  } else if (event.key === "%") {
    handleAction("percent");
  } else if (event.key === "Enter" || event.key === "=") {
    showResult();
  } else if (event.key === "Backspace") {
    handleAction("delete");
  } else if (event.key === "Escape") {
    clearCalculator();
  }
});

updateDisplay();
