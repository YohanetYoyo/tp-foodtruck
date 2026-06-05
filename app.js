class ErreurCustom extends Error {
    constructor() {
        super(message, options);
    }
}

const tableMenu = document.getElementById('menu-table');
let menu = [];
let panier = [];

async function getMenu() {
    const response = await fetch('https://keligmartin.github.io/api/menu.json');
    menu = await response.json();
    console.log(menu)

    tableMenu.innerHTML = ``;

    menu.forEach(food => {
        tableMenu.innerHTML += `
            <tr>
                <td style="display: none;">${food.id}</td>
                <td>${food.name}</td>
                <td>${food.price}</td>
                <td>${food.image}</td>
                <td><button id="ajouter" type="button" onclick="ajouter(this)" data-id="${food.id}">Ajouter</button></td>
            </tr>
        `
    })
}

function afficherPanier() {
    const table = document.getElementById('panier-table');

    table.innerHTML = '';

    if (panier.length > 0) {
        document.getElementById('panier-table').style.display = 'inline-block';
        document.querySelector('.text-muted').style.display = 'none';
    } else {
        document.getElementById('panier-table').style.display = 'none';
        document.querySelector('.text-muted').style.display = 'inline';
    }

    panier.forEach(food => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td style="display: none;">${food.id}</td>
                <td>${food.name}</td>
                <td>${food.price * food.quantite}</td>
                <td><input type="number" min="1" value="${food.quantite}" oninput="setQuantite(${food.id}, this.value)" ></td>
            </tr>
        `;
        table.appendChild(tr);
    })
}

function ajouter(button) {
    const food = menu.find(food => food.id === Number(button.dataset.id));
    const checkExistant = panier.find(food => food.id === button.dataset.id);

    if (checkExistant) {
        checkExistant.quantite++;
    } else {
        panier.push({...food, quantite: 1});
    }

    localStorage.setItem('panier', JSON.stringify(panier));

    setTotal();

    afficherPanier();
}

function setQuantite(id, value) {
    const food = panier.find(food => food.id === Number(id));

    food.quantite = value;

    localStorage.setItem('panier', JSON.stringify(panier));

    setTotal();

    afficherPanier();
}

function setTotal() {
    let total = 0;

    panier.forEach(food => {
        total += food.price * food.quantite;
    })

    document.getElementById('cart-total').textContent = total + ' €';
}

window.onload = async function() {
    try {
        await getMenu();
    } catch(err) {
        throw new ErreurCustom("Impossible d'obtenir le menu", { cause: err });
    }
}