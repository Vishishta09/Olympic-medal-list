// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const yearSelect = document.getElementById('year');
    const tableBody = document.getElementById('medalTableBody');
    const searchInput = document.getElementById('searchInput');
    const topPerformerSection = document.getElementById('top-performer');
    const chartContainer = document.querySelector('.chart-container');
    const tableHeaders = document.querySelectorAll('#medalTable th');

    // --- STATE ---
    let allMedalData = {}; // To store data for all years
    let currentYearData = []; // To store data for the selected year
    let sortColumn = 'rank';
    let sortDirection = 'asc';
    let medalChart = null; // To hold the chart instance

    // --- API ---
    const API_URL = 'http://localhost:3000/medals';

    /**
     * Fetches all medal data from the API.
     */
    async function fetchMedalData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allMedalData = await response.json();
            // Set initial data based on the selected year
            handleYearChange();
        } catch (error) {
            console.error("Could not fetch medal data:", error);
            tableBody.innerHTML = `<tr><td colspan="6">Failed to load data. Is json-server running?</td></tr>`;
        }
    }

    /**
     * Renders the table with the current data.
     */
    function renderTable() {
        // Clear existing table rows
        tableBody.innerHTML = '';

        // Apply filtering
        const filteredData = currentYearData.filter(item =>
            item.country.toLowerCase().includes(searchInput.value.toLowerCase())
        );

        // Apply sorting
        const sortedData = filteredData.sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            
            if (valA < valB) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });


        // Create and append rows
        if (sortedData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6">No results found.</td></tr>`;
            renderTopPerformer(null);
            chartContainer.style.display = 'none';
            return;
        }

        // Render the top performer card
        renderTopPerformer(sortedData[0]);

        sortedData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.rank}</td>
                <td class="country-cell">
                    <img src="https://flagcdn.com/w20/${item.code}.png" alt="${item.country} flag" class="flag-icon">
                    <span>${item.country}</span>
                </td>
                <td>${item.gold}</td>
                <td>${item.silver}</td>
                <td>${item.bronze}</td>
                <td>${item.total}</td>
            `;
            // Add click event to row for showing chart
            row.addEventListener('click', () => {
                updateChart(item);
                // Highlight the selected row
                document.querySelectorAll('#medalTableBody tr').forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
            });
            tableBody.appendChild(row);
        });
    }

    /**
     * Renders the card for the top-performing country.
     * @param {object} topCountry - The data for the top-ranked country.
     */
    function renderTopPerformer(topCountry) {
        if (!topCountry) {
            topPerformerSection.style.display = 'none';
            return;
        }

        topPerformerSection.style.display = 'block';
        topPerformerSection.innerHTML = `
            <div class="top-performer-header">
                <h2>Top Performer</h2>
                <div class="top-country">
                    <img src="https://flagcdn.com/w40/${topCountry.code}.png" alt="${topCountry.country} flag">
                    <h3>${topCountry.country}</h3>
                </div>
            </div>
            <div class="top-performer-medals">
                <div class="medal-count gold"><span>${topCountry.gold}</span>Gold</div>
                <div class="medal-count silver"><span>${topCountry.silver}</span>Silver</div>
                <div class="medal-count bronze"><span>${topCountry.bronze}</span>Bronze</div>
                <div class="medal-count total"><span>${topCountry.total}</span>Total</div>
            </div>
        `;
    }

    /**
     * Handles sorting when a table header is clicked.
     */
    function handleSort(e) {
        const newSortColumn = e.target.dataset.sort;

        // If it's the same column, just toggle the direction
        if (sortColumn === newSortColumn) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // If it's a new column, set a smart default direction
            sortColumn = newSortColumn;
            if (['gold', 'silver', 'bronze', 'total'].includes(newSortColumn)) {
                sortDirection = 'desc'; // Default to high-to-low for medal counts
            } else {
                sortDirection = 'asc'; // Default to low-to-high for rank and country
            }
        }
        
        updateSortIndicators();
        renderTable();
    }
    
    /**
     * Updates the UI to show which column is being sorted and in which direction.
     */
    function updateSortIndicators() {
        tableHeaders.forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
            if (header.dataset.sort === sortColumn) {
                header.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });
    }

    /**
     * Aggregates medal data across all years to create a combined leaderboard.
     */
    function calculateAllYearsData() {
        const aggregated = {};

        // Loop through each year's data array
        for (const year in allMedalData) {
            allMedalData[year].forEach(countryData => {
                const countryName = countryData.country;
                if (!aggregated[countryName]) {
                    aggregated[countryName] = {
                        country: countryName,
                        code: countryData.code,
                        gold: 0,
                        silver: 0,
                        bronze: 0,
                    };
                }
                aggregated[countryName].gold += countryData.gold;
                aggregated[countryName].silver += countryData.silver;
                aggregated[countryName].bronze += countryData.bronze;
            });
        }

        // Convert the aggregated object to an array and calculate total
        let combinedData = Object.values(aggregated).map(country => ({
            ...country,
            total: country.gold + country.silver + country.bronze
        }));

        // Sort to determine rank: by gold, then silver, then bronze
        combinedData.sort((a, b) => {
            if (b.gold !== a.gold) return b.gold - a.gold;
            if (b.silver !== a.silver) return b.silver - a.silver;
            return b.bronze - a.bronze;
        });

        // Assign rank
        return combinedData.map((country, index) => ({
            ...country,
            rank: index + 1
        }));
    }

    /**
     * Updates the chart with data from the selected country.
     * @param {object} countryData - The data for the selected country.
     */
    function updateChart(countryData) {
        const chartCanvas = document.getElementById('medalChart');

        // Destroy the previous chart instance to prevent rendering issues
        if (medalChart) {
            medalChart.destroy();
        }

        chartContainer.style.display = 'block';

        // Create a new horizontal bar chart
        medalChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: ['Gold', 'Silver', 'Bronze'],
                datasets: [{
                    label: 'Medal Count',
                    data: [countryData.gold, countryData.silver, countryData.bronze],
                    backgroundColor: [
                        'rgba(255, 193, 7, 0.7)',  // Gold
                        'rgba(192, 192, 192, 0.7)', // Silver
                        'rgba(205, 127, 50, 0.7)'  // Bronze
                    ],
                    borderColor: [
                        '#ffc107',
                        '#c0c0c0',
                        '#cd7f32'
                    ],
                    borderWidth: 1.5
                }]
            },
            options: {
                indexAxis: 'y', // This makes the bar chart horizontal
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Medals'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Hide legend as it's redundant
                    },
                    title: {
                        display: true,
                        text: `${countryData.country} Medal Distribution`,
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    }

    /**
     * Handles the logic when the year selection changes.
     */
    function handleYearChange() {
        const selectedYear = yearSelect.value;
        if (selectedYear === 'all') {
            currentYearData = calculateAllYearsData();
        } else {
            currentYearData = allMedalData[selectedYear] || [];
        }
        renderTable();
    }

    // --- EVENT LISTENERS ---
    yearSelect.addEventListener('change', handleYearChange);

    searchInput.addEventListener('input', renderTable);

    tableHeaders.forEach(header => {
        header.addEventListener('click', handleSort);
    });


    // --- INITIALIZATION ---
    fetchMedalData(); // Initial data fetch and render
    updateSortIndicators(); // Set the initial sort indicator on 'Rank'
});
