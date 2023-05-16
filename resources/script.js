<!DOCTYPE html>
<html>
<head>
    <title>XML to Table</title>
    <style>
        table {
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid black;
            padding: 8px;
        }
    </style>
</head>
<body>
    <table id="myTable"></table>

    <script>
        // Step 1: Retrieve the XML data
        fetch('your_xml_file.xml')
            .then(response => response.text())
            .then(data => {
                // Step 2: Parse the XML data
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, 'text/xml');

                // Step 3: Extract the data
                const items = xmlDoc.getElementsByTagName('item');

                // Step 4: Generate the HTML table
                const table = document.getElementById('myTable');
                const tableHeader = table.createTHead();
                const headerRow = tableHeader.insertRow();
                headerRow.innerHTML = '<th>ID</th><th>Name</th><th>Price</th>';

                const tableBody = table.createTBody();

                // Step 5: Populate the table
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const id = item.getAttribute('id');
                    const name = item.getElementsByTagName('name')[0].textContent;
                    const price = item.getElementsByTagName('price')[0].textContent;

                    const row = tableBody.insertRow();
                    row.innerHTML = `<td>${id}</td><td>${name}</td><td>${price}</td>`;
                }
            });
    </script>
</body>
</html>