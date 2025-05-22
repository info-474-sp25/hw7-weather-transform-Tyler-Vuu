// SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create the SVG container and group element for the chart
const svgLine = d3.select("#lineChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


// LOAD AND TRANSFORM DATA
d3.csv("weather.csv").then(data => {
    // --- CASE 1: FLATTEN ---
    // Determine your fields of interest:
    // - X: Date
    // - Y: Average Precipitation
    // - Category: City

    // 1.1: Rename and reformat
    data.forEach(d => {
        d.year = new Date(d.date); // Keep full date for now
        d.temp = +d.mean_temperature_f; // Convert mean temp to numeric
    }); 



    // Set scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.temp)]).nice()
        .range([height, 0]);

    // Draw X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%m/%Y")))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Draw Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.temp))
        );

    // Axis labels
    svg.append("text")
        .attr("x", -(height / 2))
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Mean Temperature per day (Fahrenheit)");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Date");




    // Check your work:
    console.log("=== CASE 1: FLATTEN ===");
    console.log("Raw data:", data);

    // 1.2: Filter
    const filteredData1 = data;

    // Check your work:
    console.log("Filtered data 1:", filteredData1);

    // 1.3: GROUP AND AGGREGATE
    const groupedData1 = d3.groups(filteredData1, d => d.city, d => d.year.getFullYear())
        .map(([city, years]) => {
            return years.map(([year, values]) => {
                const avgPrecip = d3.mean(values, d => d.precip);
                return {
                    city: city,
                    year: new Date(year, 0, 1), // Use Jan 1st as representative date
                    avgPrecipitation: avgPrecip
                };
            });
        }).flat();

    // Check your work:
    console.log("Grouped data 1:", groupedData1);

    // 1.4: FLATTEN
    const flattenedData = groupedData1.map(d => ({
        date: d.year,
        avgPrecipitation: d.avgPrecipitation,
        city: d.city
    }));

    // Check your work:
    console.log("Final flattened data:", flattenedData);
    console.log("---------------------------------------------------------------------");

    // --- CASE 2: PIVOT ---
    // 2.1: Rename and 
    /*
        Uncomment the following code! Hint: highlight and CTRL+/.
    */
    data.forEach(d => {
        d.year = new Date(d.date).getFullYear(); // Parse dates and get year
        d.month = new Date(d.date).getMonth() + 1; // Parse dates and get month (0-based, so add 1)
        d.actualPrecip = +d.actual_precipitation; // Convert precipitation to numeric
        d.avgPrecip = +d.average_precipitation; // Convert to numeric
        d.recordPrecip = +d.record_precipitation; // Convert to numeric
    });

    // Check your work:
    console.log("=== CASE 2: PIVOT ===");
    console.log("Raw data:", data);

    // 2.2: Filter
    const filteredData2 = data.filter(d => d.year === 2014);

    // Check your work:
    console.log("Filtered data 2:", filteredData2);

    // 2.3: Group and aggregate
    const groupedData2 = d3.groups(filteredData2, d => d.month)
        .map(([month, values]) => {
            return {
                month: month,
                avg: d3.mean(values, d => d.avgPrecip),
                actual: d3.mean(values, d => d.actualPrecip),
                record: d3.mean(values, d => d.recordPrecip)
            };
        });

    // Check your work:
    console.log("Grouped data 2:", groupedData2);

    // 2.4: FLATTEN
    const pivotedData = groupedData2.flatMap(d => [
        { month: d.month, precipitation: d.avg, type: "Average" },
        { month: d.month, precipitation: d.actual, type: "Actual" },
        { month: d.month, precipitation: d.record, type: "Record" }
    ]);

    // Check your work:
    console.log("Final pivoted data:", pivotedData);
});
