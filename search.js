// Homepage calculator search
(function() {
    const searchInput = document.getElementById('calculatorSearch');
    const calculatorCards = document.querySelectorAll('.calculator-card');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            calculatorCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                const keywords = card.dataset.keywords || '';
                
                const matches = title.includes(query) || 
                               desc.includes(query) || 
                               keywords.includes(query);
                
                card.style.display = matches ? 'flex' : 'none';
            });
        });
    }
})();
