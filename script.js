async function getProductsFromApi()
{
    try
    {
        const url = "https://corsproxy.io/?https://dev14.ageraehandel.se/sv/api/product";
        const response = await fetch(url);
        if(!response.ok)
        {
            throw new Error(`http error: ${response.status}`);
        }

        const productsJson = await response.json();
        const productsByCat = getProductsFromJson(productsJson.products);
        genHtml(productsByCat);
    }
    catch (error)
    {
        console.error("Error:", error);
    }
}

function genHtml(productsByCat){
    var amountOfProducts = 0;

    const productDiv = document.getElementById("products");
    productDiv.innerHTML = '';

    Object.keys(productsByCat).forEach(category => {
        const categoryHead = document.createElement("div");
        categoryHead.innerHTML = `<h2>${category} - ${productsByCat[category].length} artiklar</h2>`;
        productDiv.appendChild(categoryHead);

        const catSection = document.createElement("div");
        catSection.classList.add("row", "d-flex", "align-items-stretch");
        productsByCat[category].forEach(product => 
        {
            const card = document.createElement("div");
            card.classList.add("col-lg-3", "col-md-4", "col-sm-6", "col-12", "d-flex");
            card.innerHTML = `
            <div class="card mb-5 flex-fill">
                <img class="card-img-top" src="${product.image && product.image.url ? product.image.url : 'images/nophoto.png'}">
                <div class="card-body">
                    <div class="card-text">
                        <p><strong>${product.name}</strong></p>
                        <p>${product.desc || "Beskrivning saknas"}</p>
                        <p>Pris: ${product.price+product.tax} kr (inkl moms)</p>
                        <p><i class="bi bi-circle-fill" style="color: ${product.available ? 'green' : 'red'};"></i>${product.available ? ' I lager' : ' Inte i lager'} </p>
                    </div>
                </div>
            </div>
            `;
            catSection.appendChild(card);
            amountOfProducts += 1;
        })
        productDiv.appendChild(catSection);
    })
    const amount = document.createElement("div");
    amount.innerHTML = `<h2>Antal artiklar:${amountOfProducts - 2}</h2>`;
    productDiv.appendChild(amount);
}

function getProductsFromJson(productJson){
    const productArray = [];
    let firstIteration = true;
    let cheapestProduct;
    let expensiveProduct;

    productJson.forEach(product => {
        var product = {
            id: product.id,
            name: product.artiklar_benamning || product.artikelgrupper_id,
            desc: product.artiklar_variant || " ",
            tax: product.momssats,
            price: product.pris,
            available: product.flagga_varianter_finns,
            category: product.artikelkategorier_id || "Ingen kategori",
            image: product.bild || "no-photo",
        };
        if(firstIteration)
        {
            cheapestProduct = product;
            expensiveProduct = product;
            firstIteration = false;
        }
        if(cheapestProduct.price > product.price)
        {
            cheapestProduct = product;
        }
        if(expensiveProduct.price < product.price)
        {
            expensiveProduct = product;
        }

        productArray.push(product);
    });

    const categoryDict = sortByCategory(productArray, cheapestProduct, expensiveProduct);
    return categoryDict;
}

function sortByCategory(productArray, cheapestProduct, expensiveProduct)
{
    const categories = {};
    productArray.forEach(product => 
    {
        const category = product.category;
        if(!categories[category])
        {
            categories[category] = [];
        }
        categories[category].push(product);
    });
    for(const category in categories)
    {
        categories[category].sort((a, b) => a.name.localeCompare(b.name));
    }

    categories["Billigast & Dyrast"] = [cheapestProduct, expensiveProduct]

    return categories;
}

getProductsFromApi();