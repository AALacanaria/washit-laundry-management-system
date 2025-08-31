(function(){
    const body = document.getElementById('laundryItemsBody');
    const hiddenInput = document.getElementById('laundryItemsInput');

    const categories = [
        { key: 'everyday', name: 'Everyday Clothing', price: 25 },
        { key: 'delicates', name: 'Delicates & Small Items', price: 25 },
        { key: 'bedding', name: 'Bedding & Linens', price: 35 },
        { key: 'heavy', name: 'Heavy & Bulky Items', price: 35 }
    ];

    let items = categories.map(cat => ({ category: cat.key, name: cat.name, quantity: 0, unitPrice: cat.price }));

    function syncHidden(){
        hiddenInput.value = JSON.stringify(items);
    }

    function updateQuantity(category, qty) {
        const item = items.find(i => i.category === category);
        if (item) {
            item.quantity = Math.max(0, qty);
            syncHidden();
        }
    }

    // Initialize event listeners for quantity inputs
    function initializeEventListeners() {
        const qtyInputs = document.querySelectorAll('.qty-input');
        qtyInputs.forEach((input) => {
            // Get category from parent row's data-category attribute
            const row = input.closest('tr');
            const categoryKey = row ? row.getAttribute('data-category') : null;
            
            if (categoryKey) {
                input.addEventListener('input', function() {
                    const quantity = parseInt(this.value, 10) || 0;
                    updateQuantity(categoryKey, quantity);
                });

                input.addEventListener('change', function() {
                    const quantity = parseInt(this.value, 10) || 0;
                    updateQuantity(categoryKey, quantity);
                });
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEventListeners);
    } else {
        initializeEventListeners();
    }

    // Expose a validation hook used before scheduling/submit
    window.laundryItems = {
        hasItems: () => items.some(i => i.quantity > 0),
        getItems: () => items.slice(),
        updateQuantity: updateQuantity,
        ensureNotEmpty: () => {
            if (!window.laundryItems.hasItems()) {
                alert('Please specify at least some items for laundry before proceeding to schedule.');
                const firstInput = body.querySelector('.qty-input');
                if (firstInput) firstInput.focus();
                return false;
            }
            return true;
        }
    };
})();
