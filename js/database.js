/* ZeroWasteKitchen - Database filter/sort/render */
(function () {
  "use strict";

  var products = [];
  var grid = document.getElementById("product-grid");
  var countEl = document.getElementById("product-count");
  var catFilter = document.getElementById("filter-category");
  var matFilter = document.getElementById("filter-material");
  var searchInput = document.getElementById("filter-search");
  var sortSelect = document.getElementById("filter-sort");

  var durabilityOrder = { "lifetime": 4, "10-years": 3, "5-years": 2, "3-years": 1, "1-year": 0 };

  function formatCategory(slug) {
    return slug.replace(/-/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function renderCard(p) {
    var prosHtml = (p.pros || []).slice(0, 3).map(function (pr) {
      return "<li>" + pr + "</li>";
    }).join("");

    var dwIcon = p.dishwasher_safe
      ? '<span class="badge badge-dw" title="Dishwasher safe">&#x1F4A7; Dishwasher safe</span>'
      : "";

    return '<div class="product-card">' +
      '<span class="product-brand">' + p.brand + '</span>' +
      '<h3>' + p.name + '</h3>' +
      '<div class="product-meta">' +
        '<span class="badge badge-material">' + formatCategory(p.material) + '</span>' +
        dwIcon +
      '</div>' +
      '<div class="product-replaces">Replaces: ' + p.replaces + '</div>' +
      '<div class="product-price">$' + p.price_usd.toFixed(2) + '</div>' +
      '<div class="product-durability">Durability: ' + p.durability + '</div>' +
      '<ul class="product-pros">' + prosHtml + '</ul>' +
      '<span class="product-bestfor">Best for: ' + p.best_for + '</span>' +
    '</div>';
  }

  function getFiltered() {
    var cat = catFilter.value;
    var mat = matFilter.value;
    var q = searchInput.value.toLowerCase().trim();
    var sort = sortSelect.value;

    var filtered = products.filter(function (p) {
      if (cat && p.category !== cat) return false;
      if (mat && p.material !== mat) return false;
      if (q) {
        var haystack = (p.name + " " + p.brand + " " + p.replaces + " " + p.best_for + " " + p.description).toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    });

    filtered.sort(function (a, b) {
      if (sort === "price-asc") return a.price_usd - b.price_usd;
      if (sort === "price-desc") return b.price_usd - a.price_usd;
      if (sort === "durability") return (durabilityOrder[b.durability] || 0) - (durabilityOrder[a.durability] || 0);
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }

  function render() {
    var list = getFiltered();
    countEl.textContent = list.length + " product" + (list.length !== 1 ? "s" : "") + " found";
    if (list.length === 0) {
      grid.innerHTML = '<div class="no-results">No products match your filters. Try broadening your search.</div>';
      return;
    }
    grid.innerHTML = list.map(renderCard).join("");
  }

  function onFilterChange() {
    render();
  }

  catFilter.addEventListener("change", onFilterChange);
  matFilter.addEventListener("change", onFilterChange);
  searchInput.addEventListener("input", onFilterChange);
  sortSelect.addEventListener("change", onFilterChange);

  fetch("data/products.json")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      products = data;
      render();
    })
    .catch(function () {
      grid.innerHTML = '<div class="no-results">Failed to load product data.</div>';
    });
})();
