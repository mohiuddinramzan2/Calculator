(() => {
  'use strict';

  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const keys = document.querySelector('.keys');
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');
  const historyToggle = document.getElementById('historyToggle');
  const closeHistory = document.getElementById('closeHistory');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const overlay = document.getElementById('overlay');

  const STORAGE_KEY = 'calc_history_v1';

  let expression = '';   // raw expression using display operators
  let justEvaluated = false;

  // ---------- Core calculation ----------

  function toEvalString(expr) {
    return expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/%/g, '/100');
  }

  function isOperator(ch) {
    return ['+', '-', '−', '×', '÷'].includes(ch);
  }

  function formatNumber(num) {
    if (!isFinite(num)) return 'ত্রুটি';
    const rounded = Math.round((num + Number.EPSILON) * 1e10) / 1e10;
    return rounded.toLocaleString('en-US', { maximumFractionDigits: 10 });
  }

  function evaluateExpression(expr) {
    const cleaned = expr.trim();
    if (!cleaned) return null;
    const trimmed = isOperator(cleaned[cleaned.length - 1])
      ? cleaned.slice(0, -1)
      : cleaned;
    if (!trimmed) return null;

    try {
      const evalStr = toEvalString(trimmed);
      if (!/^[0-9+\-*/.%() ]+$/.test(evalStr)) return null;
      const value = Function(`"use strict"; return (${evalStr})`)();
      if (typeof value !== 'number' || !isFinite(value)) return null;
      return value;
    } catch (e) {
      return null;
    }
  }

  function updateDisplay() {
    expressionEl.textContent = expression;
    const val = evaluateExpression(expression);
    resultEl.textContent = expression === '' ? '0' : (val === null ? '' : formatNumber(val));
  }

  // ---------- Input handling ----------

  function appendValue(value) {
    if (justEvaluated) {
      if (!isNaN(value) || value === '.') {
        expression = '';
      }
      justEvaluated = false;
    }

    const last = expression[expression.length - 1];

    if (value === '.') {
      const segments = expression.split(/[+\-−×÷]/);
      const currentSegment = segments[segments.length - 1];
      if (currentSegment.includes('.')) return;
      if (currentSegment === '') expression += '0';
    }

    if (isOperator(value)) {
      if (expression === '') return;
      if (isOperator(last)) {
        expression = expression.slice(0, -1) + value;
        updateDisplay();
        return;
      }
    }

    expression += value;
    updateDisplay();
  }

  function handleClear() {
    expression = '';
    justEvaluated = false;
    updateDisplay();
  }

  function handleDelete() {
    if (justEvaluated) {
      handleClear();
      return;
    }
    expression = expression.slice(0, -1);
    updateDisplay();
  }

  function handlePercent() {
    if (expression === '') return;
    const last = expression[expression.length - 1];
    if (isOperator(last)) return;
    expression += '%';
    updateDisplay();
  }

  function handleEquals() {
    if (expression === '') return;
    const val = evaluateExpression(expression);
    if (val === null) {
      resultEl.textContent = 'ত্রুটি';
      return;
    }
    const displayExpr = expression;
    saveToHistory(displayExpr, formatNumber(val));
    expression = formatNumber(val).replace(/,/g, '');
    justEvaluated = true;
    expressionEl.textContent = displayExpr + ' =';
    resultEl.textContent = formatNumber(val);
  }

  // ---------- History (localStorage) ----------

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistoryList(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('history save failed', e);
    }
  }

  function saveToHistory(expr, result) {
    const list = loadHistory();
    list.unshift({
      expr,
      result,
      time: new Date().toISOString()
    });
    if (list.length > 100) list.length = 100;
    saveHistoryList(list);
    renderHistory();
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString('bn-BD', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function renderHistory() {
    const list = loadHistory();
    historyList.innerHTML = '';
    if (list.length === 0) {
      historyList.innerHTML = '<p class="history-empty">এখনো কোনো হিসাব সেভ হয়নি</p>';
      return;
    }
    list.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="h-expr">${item.expr} =</div>
        <div class="h-result">${item.result}</div>
        <div class="h-time">${formatTime(item.time)}</div>
      `;
      div.addEventListener('click', () => {
        expression = item.result.replace(/,/g, '');
        justEvaluated = true;
        updateDisplay();
        toggleHistory(false);
      });
      historyList.appendChild(div);
    });
  }

  function toggleHistory(open) {
    historyPanel.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
  }

  // ---------- Event wiring ----------

  keys.addEventListener('click', (e) => {
    const btn = e.target.closest('button.key');
    if (!btn) return;
    const action = btn.dataset.action;
    const value = btn.dataset.value;

    if (action === 'clear') return handleClear();
    if (action === 'delete') return handleDelete();
    if (action === 'percent') return handlePercent();
    if (action === 'equals') return handleEquals();
    if (action === 'operator') return appendValue(value);
    return appendValue(value);
  });

  historyToggle.addEventListener('click', () => toggleHistory(true));
  closeHistory.addEventListener('click', () => toggleHistory(false));
  overlay.addEventListener('click', () => toggleHistory(false));
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('সব হিস্টোরি মুছে ফেলতে চান?')) {
      saveHistoryList([]);
      renderHistory();
    }
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const map = { '*': '×', '/': '÷', '-': '−' };
    if (/[0-9.]/.test(e.key)) return appendValue(e.key);
    if (['+', '-', '*', '/'].includes(e.key)) return appendValue(map[e.key] || e.key);
    if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); return handleEquals(); }
    if (e.key === 'Backspace') return handleDelete();
    if (e.key === 'Escape') return handleClear();
    if (e.key === '%') return handlePercent();
  });

  // Init
  renderHistory();
  updateDisplay();
})();
