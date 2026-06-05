class ErreurCustom extends Error {
    constructor() {
        super(message, options);
    }
}

const tableMenu = document.getElementById('menu-table');
let menu = [];

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
            </tr>
        `
    })
}

window.onload = async function() {
    try {
        await getMenu();
    } catch(err) {
        throw new ErreurCustom("Impossible d'obtenir le menu", { cause: err });
    }
}