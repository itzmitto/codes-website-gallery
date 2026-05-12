document.getElementById('knop').addEventListener('click', function () { 

    const invoer = document.getElementById('getal').value; 
    const getal = parseInt(invoer);

    const resultaatDiv = document.getElementById('resultaat');
    resultaatDiv.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const product = i * getal;
        const regel = i + ' x ' + getal + ' = ' + product;

        const p = document.createElement('p');
        p.textContent = regel;
        resultaatDiv.appendChild(p);
    }
});  