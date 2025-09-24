# Olympic Medal Standings Project

## Project Overview

This project displays Olympic medal standings for various years (2000, 2004, 2008, 2012, 2016, 2020, and 2024). It allows users to view the medal table for a specific year or a combined leaderboard across all years. Users can also search for specific countries and sort the table by rank, country, or medal count.  A chart is displayed when a row is clicked, showing the medal distribution for that country. The project fetches data from a JSON server.

## Setup Instructions

1.  **Install JSON Server:**

    If you don't have it already, install JSON Server globally using npm:

    ```bash
    npm install -g json-server
    ```

2.  **Run JSON Server:**

    Navigate to the project directory in your terminal. Then, start the JSON server using the `db.json` file provided:

    ```bash
    json-server --watch db.json --port 3000
    ```

    This command will start the JSON server, serving the medal data on `http://localhost:3000/medals`.

3.  **Open the Project:**

    Open the `index.html` file in your web browser.

## Features Implemented

*   **Year Selection:** Users can select a specific year from a dropdown to view medal standings for that year or select "All Years (Combined)" for an aggregated leaderboard.
*   **Search:** Users can search for a specific country in the medal table using the search input field.
*   **Sorting:** The table can be sorted by rank, country name, gold, silver, bronze, or total medals.
*   **Top Performer:** Displays a card highlighting the top-performing country based on the selected year or combined data.
*   **Medal Chart:** Clicking on a country row displays a chart showing the distribution of gold, silver, and bronze medals for that country.
*   **Responsive Design:** The layout adjusts for different screen sizes, providing a better user experience on various devices.
*   **Dynamic Flag Icons:** Country names are displayed alongside their flag icons.

## Pending Features (if any)

As of the current implementation, there are no explicitly pending features. However, potential future enhancements could include:

*   **Adding more years of Olympic data.**
*   **Implementing more sophisticated data visualizations.**
*   **Allowing users to compare medal standings between different years.**
*   **Adding unit tests to improve code reliability.**
