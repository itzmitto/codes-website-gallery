const display = document.getElementById('display');
const getVal = () => display.value;
const setVal = (v) => display.value = v;

function append(value) { setVal(getVal() + value); }
function clearDisplay() { setVal(''); }
function deleteLast() { setVal(getVal().slice(0, -1)); }

function toggleSign() {
    const v = getVal();
    if (!v) return;
    setVal(v.startsWith('-') ? v.slice(1) : '-' + v);
}

function calculate() {
    try {
        setVal(parseFloat(eval(getVal()).toPrecision(10)).toString());
    } catch {
        setVal('Fout');
    }
}

document.addEventListener('keydown', (e) => {
    if (!isNaN(e.key) || '+-*/.%'.includes(e.key)) append(e.key);
    else if (e.key === 'Enter') calculate();
    else if (e.key === 'Backspace') deleteLast();
    else if (e.key === 'Escape') clearDisplay();
});