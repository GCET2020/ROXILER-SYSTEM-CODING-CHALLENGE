document.addEventListener('DOMContentLoaded', function () {
    const monthSelect = document.getElementById('month');
    const searchInput = document.getElementById('search');
    const transactionsTableBody = document.querySelector('#transactions-table tbody');
    const totalSalesSpan = document.getElementById('total-sales');
    const soldItemsSpan = document.getElementById('sold-items');
    const notSoldItemsSpan = document.getElementById('not-sold-items');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const barChartCanvas = document.getElementById('bar-chart');

    let currentPage = 1;
    const perPage = 10;

    let barChart;

    function fetchTransactions(month, search = '', page = 1) {
        axios.get(`/api/transactions`, {
            params: {
                month: month,
                search: search,
                page: page,
                perPage: perPage
            }
        }).then(response => {
            const transactions = response.data;
            renderTransactions(transactions);
        }).catch(error => {
            console.error('Error fetching transactions:', error);
        });
    }

    function fetchStatistics(month) {
        axios.get(`/api/statistics`, { params: { month: month } })
            .then(response => {
                const stats = response.data;
                totalSalesSpan.textContent = stats.totalSales;
                soldItemsSpan.textContent = stats.soldItems;
                notSoldItemsSpan.textContent = stats.notSoldItems;
            }).catch(error => {
                console.error('Error fetching statistics:', error);
            });
    }

    function fetchBarChart(month) {
        axios.get(`/api/barchart`, { params: { month: month } })
            .then(response => {
                const data = response.data;
                renderBarChart(data);
            }).catch(error => {
                console.error('Error fetching bar chart data:', error);
            });
    }

    function renderTransactions(transactions) {
        transactionsTableBody.innerHTML = '';
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.title}</td>
                <td>${transaction.description}</td>
                <td>${transaction.price}</td>
                <td>${transaction.category}</td>
                <td>${transaction.dateOfSale}</td>
                <td>${transaction.sold ? 'Yes' : 'No'}</td>
            `;
            transactionsTableBody.appendChild(row);
        });
    }

    function renderBarChart(data) {
        const labels = Object.keys(data);
        const values = Object.values(data);

        if (barChart) {
            barChart.destroy();
        }

        barChart = new Chart(barChartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Items',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    monthSelect.addEventListener('change', () => {
        const month = monthSelect.value;
        currentPage = 1;
        fetchTransactions(month, searchInput.value, currentPage);
        fetchStatistics(month);
        fetchBarChart(month);
    });

    searchInput.addEventListener('input', () => {
        const month = monthSelect.value;
        fetchTransactions(month, searchInput.value, currentPage);
    });

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            const month = monthSelect.value;
            fetchTransactions(month, searchInput.value, currentPage);
        }
    });

    nextButton.addEventListener('click', () => {
        currentPage++;
        const month = monthSelect.value;
        fetchTransactions(month, searchInput.value, currentPage);
    });

    // Initial fetch
    const initialMonth = 'March';
    fetchTransactions(initialMonth);
    fetchStatistics(initialMonth);
    fetchBarChart(initialMonth);
});

