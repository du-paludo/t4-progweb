const modal = document.getElementById('modal');
const popupHeader = document.getElementById('popupHeader');
const popupTable = document.getElementById('popupTable');
const popupTableBody = document.getElementById('popupTable').tBodies[0];
const curriculum = document.getElementById('curriculum');
const cells = curriculum.getElementsByTagName('td');
for (let i = 0; i < cells.length; i++) {
    // Add event listener to each cell
    cells[i].addEventListener('click', handleLeftClick);
    cells[i].addEventListener('contextmenu', handleRightClick)
    // Change cell color when hovering
    cells[i].addEventListener('mouseover', function() {
        this.style.filter = 'brightness(0.9)';
    });
    // Reset cell color when not hovering
    cells[i].addEventListener('mouseout', function() {
        this.style.filter = '';
    });
}

// Each key of the dictionary is a GRR and each value is a dictionary of courses
let tables = {};
let currentStudent;

// When the user clicks anywhere outside of the modal, close it
document.addEventListener('click', function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

function fetchXML(path) {
    fetch(path)
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');

        const students = xmlDoc.getElementsByTagName('ALUNO');
        
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const grr = student.getElementsByTagName('MATR_ALUNO')[0].textContent;
            const course = student.getElementsByTagName('COD_ATIV_CURRIC')[0].textContent;
            let code = course;
            const type = student.getElementsByTagName('DESCR_ESTRUTURA')[0].textContent;
            const name = student.getElementsByTagName('NOME_ATIV_CURRIC')[0].textContent;
            const year = student.getElementsByTagName('ANO')[0].textContent;
            const semester = student.getElementsByTagName('PERIODO')[0].textContent;
            const situation = student.getElementsByTagName('SITUACAO')[0].textContent;
            const grade = student.getElementsByTagName('MEDIA_FINAL')[0].textContent;
            const attendance = parseInt(student.getElementsByTagName('FREQUENCIA')[0].textContent).toFixed(2);
            let row;

            if (type == 'Trabalho de Graduação I') {
                code = 'TGI';
            } else if (type == 'Trabalho de Graduação II') {
                code = 'TGII';
            } else if (type == 'Optativas') {
                code = 'OPT';
                for (let i = 1; i <= 6; i++) {
                    if (tables[grr]['OPT' + i] == null) {
                        code += i;
                        break;
                    }
                }
            }

            // If the dictionary for the student doesn't exist yet, create it
            if (tables[grr] == null) {
                tables[grr] = {};
            }

            // If the table for the course doesn't exist yet, create it
            if (tables[grr][code] == null) {
                tables[grr][code] = createTable();
            }

            if ((type == 'Optativas') && (code != 'OPT')) {
                if (tables[grr]['OPT'] == null) {
                    tables[grr]['OPT'] = createTable();
                }
                row = tables[grr]['OPT'].getElementsByTagName('tbody')[0].insertRow();
                row.innerHTML = `<td>${course}</td><td>${name}</td><td>${year}</td><td>${semester}</td><td>${situation}</td><td>${grade}</td><td>${attendance}</td>`;
            }
            row = tables[grr][code].getElementsByTagName('tbody')[0].insertRow();
            row.innerHTML = `<td>${course}</td><td>${name}</td><td>${year}</td><td>${semester}</td><td>${situation}</td><td>${grade}</td><td>${attendance}</td>`;
        }
    });
}

function searchGRR() {
    const grrinput = document.getElementById('grrinput');
    const grr = 'GRR' + grrinput.value;
    const studentData = tables[grr];
    if (studentData != null) {
        currentStudent = grr;
        colorizeTable();
    } else {
        alert('GRR não encontrado');
    }
}

function showHistory(code) {    
    if (currentStudent == null) {
        alert('Nenhum aluno selecionado');
        return;
    }
    if (code.startsWith('OPT')) {
        code = 'OPT';
    }
    modal.style.display = 'block';
    popupHeader.innerHTML = 'Histórico completo';
    if (tables[currentStudent][code] == null) {
        popupTable.innerHTML = 'Matéria não cursada pelo aluno';
    } else {
        console.log(currentStudent, code);
        popupTable.innerHTML = tables[currentStudent][code].outerHTML;
    }
}

function showLastCourse(code) {
    if (currentStudent == null) {
        alert('Nenhum aluno selecionado');
        return;
    }
    modal.style.display = 'block';
    popupHeader.innerHTML = 'Última vez cursada';
    if (tables[currentStudent][code] == null) {
        popupTable.innerHTML = 'Matéria não cursada pelo aluno';
    } else {
        const table = tables[currentStudent][code];
        const rows = table.getElementsByTagName('tr');
        const lastRow = rows[rows.length - 1];
        const lastRowHTML = `<tbody>` + lastRow.innerHTML + `</tbody>`;
        const header = `<thead><th>Código</th><th>Nome</th><th>Ano</th><th>Período</th><th>Situação</th><th>Nota</th><th>Frequência</th></thead>`;
        popupTable.innerHTML = header + lastRowHTML;
    }
}
  
function closePopup() {
    modal.style.display = 'none';
}

function handleLeftClick(event) {
    const clickedCell = event.target;
    const code = clickedCell.id;
    showLastCourse(code);
}

function handleRightClick(event) {
    event.preventDefault();
    const clickedCell = event.target;
    const code = clickedCell.id;
    showHistory(code);
}

function colorizeTable() {
    for (let i = 0; i < cells.length; i++) {
        let code = cells[i].id;
        if (tables[currentStudent][code] == null) {
            cells[i].style.backgroundColor = '#606060';
            continue;
        }
        let rows = tables[currentStudent][code].getElementsByTagName('tr');
        let situation = rows[rows.length - 1].getElementsByTagName('td')[4].textContent;
        if (situation == 'Aprovado') {
            cells[i].style.backgroundColor = '#4CAF50';
        } else if ((situation == 'Reprovado por nota') || (situation == 'Reprovado por Frequência')) {
            cells[i].style.backgroundColor = '#F44336';
        } else if (situation == 'Equivalência de Disciplina') {
            cells[i].style.backgroundColor = '#FBC02D';
        } else if (situation == 'Matrícula') {
            cells[i].style.backgroundColor = '#1E88E5';
        } else {
            cells[i].style.backgroundColor = '#3E3E42';
        }
    }
}

function validateNumberInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
}

function createTable() {
    let table = document.createElement('table');
    const tableHeader = table.createTHead();
    const headerRow = tableHeader.insertRow();
    headerRow.innerHTML = '<th>Código</th><th>Nome</th><th>Ano</th><th>Período</th><th>Situação</th><th>Nota</th><th>Frequência</th>';
    table.createTBody();
    return table;
}

fetchXML('resources/alunos.xml');