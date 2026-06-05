class ErreurCustom extends Error {
    constructor() {
        super(message, options);
    }
}

let menu = [];
let panier = [];
let orders = [];

const tableMenu = document.getElementById('menu-table');

async function getMenu() {
    const response = await fetch('https://keligmartin.github.io/api/menu.json');
    menu = await response.json();

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
        document.getElementById('btn-order').disabled = false;
    } else {
        document.getElementById('panier-table').style.display = 'none';
        document.querySelector('.text-muted').style.display = 'inline';
        document.getElementById('btn-order').disabled = true;
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

function recapitulatif() {
    let message = "";
    let total = 0;
    panier.forEach(food => {
        total += food.price * food.quantite;
        message += `${food.quantite} ${food.name} (${food.price} € l'unité) : ${food.price * food.quantite} € au total\n`;
    })
    message += `\nTotal panier : ${total} €\nTVA : 10%\nTTC : ${total + (total * 0.10)} €\n\nCliquez sur 'OK' pour confirmer votre commande`;

    const modal = confirm(message);

    if (modal) {
        fakePostCommande().then(res => {
            orders.push({id: (orders.length + 1), panier: panier, status:'Préparation...'});

            document.getElementById('btn-order').textContent = 'Commander';

            const toast = document.getElementById('notification');
            const toastBody = document.querySelector('.toast-body');
            console.log(toastBody);
            toastBody.textContent = res;

            new bootstrap.Toast(toast).show()

            panier = [];
            localStorage.setItem('panier', JSON.stringify(panier));

            afficherPanier();
            setTotal();

            afficherCommandes();
        }).catch(err => {
            document.getElementById('btn-order').textContent = 'Commander';

            const toast = document.getElementById('notification');
            const toastBody = document.querySelector('.toast-body');
            console.log(toastBody);
            toastBody.textContent = err;

            new bootstrap.Toast(toast).show()
        })
    }
}

async function fakePostCommande() {
    const btnOrder = document.getElementById('btn-order');
    btnOrder.textContent = 'Envoi en cours...';
    btnOrder.disabled = true;
    return new Promise((resolve, reject) => {
        if (orders.length >= 5) {
            reject('Il ne peut y avoir plus de 5 commandes en cours !')
        }
        setTimeout(() => {
            resolve('Commande envoyée avec succès !')
        }, 3000)
    })
}

function afficherCommandes() {
    const table = document.getElementById('order-table');

    table.innerHTML = '';

    orders.forEach(order => {
        const thead = document.createElement('tr');
        thead.innerHTML = `
        <tr>
        <td colspan="3"><b>Commande n°${order.id}</b></td>
        <td><p id='status${order.id}'>${order.status}</p></td>
        </tr>
        `

        table.appendChild(thead);

        order.panier.forEach(food => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <tr>
                <td>${food.name}</td>
                <td>${food.quantite}</td>
                <td>${food.price * food.quantite}</td>
            </tr>
        `;
            table.appendChild(tr);
        })
        statutCommande(order.id).then(r => console.log(r));
    })
}

async function statutCommande(id) {
    const order = orders.find(order => order.id === Number(id));
    const status = document.getElementById(`status${id}`);

    if (order.status === 'Préparation...') {
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                order.status = 'En livraison...';
                status.textContent = 'En livraison...';
                resolve('En livraison...')
            }, 3000)
        });
        return await new Promise((resolve, reject) => {
            setTimeout(() => {
                order.status = 'Livré !';
                status.textContent = 'Livré !';
                resolve('Livré !')
            }, 3000)
        })
    } else if ('En livraison...') {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('Livré !')
            }, 3000)
        })
    }
}

window.onload = async function() {
    try {
        await getMenu();
    } catch(err) {
        throw new ErreurCustom("Impossible d'obtenir le menu", { cause: err });
    }

    document.getElementById('btn-order').addEventListener('click', async e => {
        if (panier.length === 0) return;

        recapitulatif();
    })
}