//  clientes
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


const supabaseUrl = 'https://enylxsrythcuktgsstjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVueWx4c3J5dGhjdWt0Z3NzdGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMxMzk1NjgsImV4cCI6MjAyODcxNTU2OH0.r9Jjpa0NCSDKNyHSvWmZ9tBNFDC-N1qjWWfrGQ8bxUY';
const supabase = createClient(supabaseUrl, supabaseKey)

const clientForm = document.getElementById('clientForm');
const clientList = document.getElementById('clientList');
const clientSelect = document.getElementById('clientSelect');
const loanForm = document.getElementById('loanForm');
const loanList = document.getElementById('loanList');
const loanSelect = document.getElementById('loanSelect');
const searchOptions1 = document.getElementById('ice-cream-flavors');

var Client = [];
var Loan = [];
var Payment = [];
//inicializacion
window.addEventListener('DOMContentLoaded', async () =>{ //reset everything
    let { data: ClientSupa, error } = await supabase
    .from('Client')
    .select('*')
    
    let { data: LoanSupa, error1 } = await supabase
    .from('Loan')
    .select('*')
    
    let { data: PaymentSupa, error2 } = await supabase
    .from('Pagos')
    .select('*')
        
    Client = ClientSupa;
    Loan = LoanSupa;
    Payment = PaymentSupa;
    


    //agregamos las opciones al select en prestamos
    clientSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
    Client.forEach(client => {
        const option = document.createElement('option');
        option.value = client.clientName;
        option.textContent = client.clientName;
        clientSelect.appendChild(option);

        
    });
    const LoanActive1 = Loan.filter(loan => loan.estado === "Active");
    loanSelect.innerHTML = '<option value="">Seleccione un préstamo</option>';
    LoanActive1.forEach(loan => {
        const option1 = document.createElement('option');
        option1.value = loan.clientName;
        option1.textContent = loan.clientName;
        loanSelect.appendChild(option1);

        const option2 = document.createElement('option'); // validar los clientes que estan activos
        option2.value = loan.clientName;
        option2.textContent = loan.clientId +' #'+loan.id;
        
        searchOptions1.appendChild(option2);
     
    });

    renderLoanTable();
});

async function actualizarDatos(){
  let { data: ClientSupa3, error3 } = await supabase
    .from('Client')
    .select('*')
    
    let { data: LoanSupa3, error31} = await supabase
    .from('Loan')
    .select('*')
    
   
        
    Client = ClientSupa3;
    Loan = LoanSupa3;
    
    

}

//popup
const inputBusqueda = document.querySelector('.input-busqueda');
const selectedFlavor = document.getElementById('selected-flavor');
const popup = document.getElementById('popup');
const closeButton = document.querySelector('.close-button');
const popupContent = document.querySelector('.popup-content');
const overlay = document.querySelector('.overlay');

inputBusqueda.addEventListener('input', function() {

  const selectedOption = document.querySelector(`#ice-cream-flavors option[value="${this.value}"]`);

  if (selectedOption) {
   

    selectedFlavor.textContent = selectedOption.value;
    popup.style.display = 'flex';
    overlay.style.display = 'block';

    popupVale(parseInt(selectedOption.textContent.split('#')[1]),selectedOption.value,parseInt(selectedOption.textContent.split('#')[0]));
  }
});

closeButton.addEventListener('click', function() {
  popup.style.display = 'none';
  overlay.style.display = 'none';
});

window.addEventListener('click', function(event) {
  if (event.target === overlay) {
    popup.style.display = 'none';
    overlay.style.display = 'none';
  }else{}
inputBusqueda.value = '';
});
function formatearMoneda(numero) {
  return numero.toLocaleString('es-ES', { minimumFractionDigits: 0 });
}

function popupVale(OptionLoanId,OptionLoanClientName,OptionLoanClientId){
  
  console.log('pasa por aca')
  //tablePopup 
  const LoanToRender = Loan.find(loan2 => loan2.id === OptionLoanId);
  
  
  const fechaInicio = LoanToRender.fecha;
  const numeroCuotas = LoanToRender.loanTerm;
  const valorCuota1 = LoanToRender.valorCuota;
  document.getElementById('inputPopup').value = valorCuota1;

  const amount = formatearMoneda( LoanToRender.loanAmount);
  const tableHeader = document.querySelector('#quoteTable thead')
  tableHeader.innerHTML = `

  <tr>
  <td colspan="2" >${OptionLoanClientName}</td>
  <td >${OptionLoanClientId}</td>
  </tr>
  <tr>
  <td colspan="2">Fec ha</td>
  <td >${fechaInicio}</td>
  </tr>
  <tr>
  <td colspan="2">Valor Prestamo</td>
  <td >${amount}</td>
  </tr>
  <tr>
  <td colspan="2"># Cuotas</td>
  <td >${numeroCuotas}</td>
  </tr>

`;

  const tableBody = document.querySelector('#quoteTable tbody')
  tableBody.innerHTML = '';
  const LoanPaymentPopup = Payment.filter(pay => pay.loanClientId === OptionLoanId);
  
  LoanPaymentPopup.forEach((paguito,index) => {
    const rowPago = document.createElement('tr');

    const indexCell = document.createElement('td');
    indexCell.classList.add('small-column');
    indexCell.textContent=index+1;

    const dateCell = document.createElement('td');
    dateCell.classList.add('medium-column');
    dateCell.textContent=paguito.fecha;
    
    const paymentCell = document.createElement('td');
    paymentCell.classList.add('medium-column');
    paymentCell.textContent = formatearMoneda(paguito.pago)

    rowPago.appendChild(indexCell);
    rowPago.appendChild(dateCell);
    rowPago.appendChild(paymentCell);

    tableBody.appendChild(rowPago)

  });
  tableBody.innerHTML+="<tr><td colspan = 3></td></tr>"
  

  document.getElementById('botonPagarPopup').addEventListener('click', 
  function() {
   
    var fechaActual = new Date();
    var fechaHoy = fechaActual.toLocaleString().slice(0, 19);
    
    makePayment(OptionLoanClientName,OptionLoanId,fechaHoy, valorCuota1, LoanToRender.deudaActual);
    // makePayment(loanClientName,loanId,fechaHoy, paymentAmount, loanDeudaActual);
  });
}

 

//                 PRESTAMOS

// 1. Inicializamos funciones
var etiquetasCuotation = document.querySelectorAll('.cuotation');
etiquetasCuotation.forEach(function(etiqueta) {
    etiqueta.addEventListener('change', CalculateQuote);
});
function CalculateQuote(){ 
    const loanAmount = document.getElementById('loanAmount').value;
    const loanInterest = document.getElementById('loanInterest').value;
    const loanTerm = document.getElementById('loanTerm').value;
    const monthlyPayment = calculateMonthlyPayment2(loanAmount, loanInterest, loanTerm);
    // const monthlyPayment = calculateMonthlyPayment1(loanAmount, loanInterest, loanTerm);
    document.getElementById('valorCuota').value = monthlyPayment;
    document.getElementById('valorCuotaAproximada').value =  Math.ceil(monthlyPayment / 100) * 100;
};
function calculateMonthlyPayment1(amount, interest, term) {
    const monthlyInterest = interest / 100;
    const months = term;
    const x = Math.pow(1 + monthlyInterest, months);
    const monthlyPayment = (amount * x * monthlyInterest) / (x - 1);
   
    return monthlyPayment.toFixed(0);
}
function calculateMonthlyPayment2(amount, interest, term) {
    const monthlyInterest = interest / 100;
    const monthlyPayment = (amount / term) * (1 + monthlyInterest);
    // const monthlyPayment = (amount * x * monthlyInterest) / (x - 1);
   
    return monthlyPayment.toFixed(0);
}
// 2.upload a supabase
loanForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const clientName = document.getElementById('clientSelect').value;
    const clientId = Client.find(cliente => cliente.clientName === clientName).id;
    var fechaActual = new Date();
    var fechaHoy = fechaActual.toLocaleString().slice(0, 19);
    const loanMode = document.getElementById('clientMode').value;
    const loanAmount = document.getElementById('loanAmount').value;
    const loanInterest = document.getElementById('loanInterest').value;
    const loanTerm = document.getElementById('loanTerm').value;
    const valueCuota = document.getElementById('valorCuotaAproximada').value;
    if(clientName === "" || loanAmount === "" || loanInterest === "" || loanTerm === "" || valueCuota === ""){
        alert("Por favor llene todos los campos");
        return;
    }
    
    addLoan(clientName,clientId, loanMode, loanAmount, loanInterest, loanTerm, valueCuota,fechaHoy);
    // falta agregar una funcion on change de el select para alertar que ya existen prestamos bajo esa persona
});
function filtrarPorEstadoYCliente(array, estado, clienteId) {
    return array.find(obj => obj.estado === estado && obj.loanClientId === clienteId);
  }

async function addLoan(clientName, clientId,loanMode,loanAmount,loanInterest,loanTerm,fee,Loandate) {
    const { data, error } = await supabase
    .from('Loan')
    .insert([
    { clientName: clientName,
        clientId: clientId,
        loanMode: loanMode,
        loanAmount: loanAmount,
        loanInterest: loanInterest,
        loanTerm: loanTerm,
        valorCuota: fee,
        fecha: Loandate,
        deudaActual: fee * loanTerm,
    },
    ])
    .select()


    const optionLoan = document.createElement('option');
    optionLoan.value = clientName;
    optionLoan.textContent = clientName;
    loanSelect.appendChild(optionLoan);
    loanForm.reset();
    location.reload();

}



// Pagos
const paymentForm = document.getElementById('paymentForm');
const paymentList = document.getElementById('paymentList');

// Clientes


clientForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const clientName = document.getElementById('clientName').value;
    const clientId = document.getElementById('clientId').value;
    const clientCellphone = document.getElementById('clientCellphone').value;
    const clientAdress = document.getElementById('clientAdress').value;
    const clientNameFiador = document.getElementById('clientNameFiador').value;
    const clientIdFiador = document.getElementById('clientIdFiador').value;
    const clientCellphoneFiador = document.getElementById('clientCellphoneFiador').value;
    const clientAdressFiador = document.getElementById('clientAdressFiador').value;
    const clientLender = document.getElementById('clientLender').value;
    addClient(clientName,clientId,clientCellphone,clientAdress,clientNameFiador,clientIdFiador,clientCellphoneFiador,clientAdressFiador,clientLender);
    
});

async function addClient(name,Id,Cellphone,Adress,NameFiador,IdFiador,CellphoneFiador,AdressFiador,Lender) {
   
    const { data, error } = await supabase
    .from('Client')
    .insert([
    { id: Id, clientName:name, clientCellphone:Cellphone, clientAdress:Adress, clientNameFiador:NameFiador, clientIdFiador:IdFiador, clientCellphoneFiador:CellphoneFiador, clientAdressFiador:AdressFiador,clientLender:Lender},
    ]).select()

    
    const optionClient = document.createElement('option');
    optionClient.value = clientName;
    optionClient.textContent = clientName;
    clientSelect.appendChild(optionClient);
    clientForm.reset();
    location.reload();
}


//           PAGOS CUOTAS

paymentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const loanClientName = document.getElementById('loanSelect').value;
    const loanObject = Loan.find(loan => loan.clientName === loanClientName && loan.estado =="Active"); // todas las busquedas tienen que tener el validador de active
    const loanId = loanObject.id;
    const loanDeudaActual = loanObject.deudaActual;
    
    var fechaActual = new Date();
    var fechaHoy = fechaActual.toLocaleString().slice(0, 9);
    const paymentAmount = document.getElementById('paymentAmount').value;
    makePayment(loanClientName,loanId,fechaHoy, paymentAmount, loanDeudaActual);
    

});

loanSelect.addEventListener('change', (e) => {
    
    const loanValorCuota= Loan.find(loan => loan.clientName === e.target.value).valorCuota;
   
    if (loanValorCuota !== "") {
        document.getElementById('paymentAmount').value = loanValorCuota;
    }
    //agregar funcion para que muestre tambien cuanto debe
    
});
async function makePayment(loanClientName,loanId,fechaHoy, paymentAmount, loanDebt) {
    
    const { data, error } = await supabase
    .from('Pagos')
    .insert([
    { loanClientName: loanClientName,loanClientId: loanId, fecha: fechaHoy, pago: paymentAmount},
    ]).select()     
    paymentForm.reset();
    //desarrollar una funcion que actualice la deuda actual del prestamo
   
    if(loanDebt - paymentAmount <= 0){
        const { data3, error3 } = await supabase
        .from('Loan')
        .update({estado: "Paid",deudaActual: 0})
        .eq('id', loanId)
        .select()
        // TODO: si esto sucede toca renderizar todo nuevamente
    }else{
      const { data4, error4 } = await supabase
      .from('Loan')
      .update({deudaActual: loanDebt - paymentAmount})
      .eq('id', loanId)
      .select()   
    }
    console.log(Payment)
    let { data: PaymentSupa3, error32 } = await supabase
    .from('Pagos')
    .select('*')
    Payment = PaymentSupa3;
    
    if(popup.style.display === 'flex'){
      console.log(Payment)
      popup.style.display = 'none';
      overlay.style.display = 'none';
      alert('Pago realizado con exito');
      // volver a renderizar ?
    }

    
    // Payment.push({loanClientName: loanClientName,loanClientId: loanId, fecha: fechaHoy, pago: parseFloat(paymentAmount)});

    // const sumaPagada = Payment.filter(p => p.loanClientId === loanId).reduce((acumulador, objeto) => {return acumulador + objeto.pago},0);
    


    // console.log(sumaPagada);
    // //TODO: reboot database and muck arround the data to prove this function
    // if( sumaPagada >= loanDebt){
    //     const { data, error } = await supabase
    //     .from('Loan')
    //     .update({estado: "Paid"})
    //     .eq('id', loanId)
    //     .select()   
    // }
}

/// ni puta idea por ahora de que son

function editClient(index) {
    const newName = prompt('Ingrese el nuevo nombre del cliente', clients[index].name);
    if (newName) {
        clients[index].name = newName;
        localStorage.setItem('clients', JSON.stringify(clients));
        renderClients();
    }
}

function deleteClient(index) {
    clients.splice(index, 1);
    localStorage.setItem('clients', JSON.stringify(clients));
    renderClients();
}



function updateLoanSelect() {
    loanSelect.innerHTML = '<option value="">Seleccione un préstamo</option>';
    loans.forEach((loan, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Cliente: ${loan.client} - Monto: ${loan.amount} - Interés: ${loan.interest}% - Plazo: ${loan.term} meses`;
        loanSelect.appendChild(option);
    });
}

function renderPayments(loanIndex) {
    paymentList.innerHTML = '';
    const loan = loans[loanIndex];
    loan.payments.forEach(payment => {
        const li = document.createElement('li');
        li.textContent = `Pago: $${payment.amount} - Fecha: ${payment.date}`;
        paymentList.appendChild(li);
    });
}

// Funciones para préstamos
function renderLoans() {
    loanList.innerHTML = '';
    loans.forEach((loan, index) => {
        const li = document.createElement('li');
        li.textContent = `Cliente: ${loan.client} - Monto: ${loan.amount} - Interés: ${loan.interest}% - Plazo: ${loan.term} meses`;
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.addEventListener('click', () => editLoan(index));
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.addEventListener('click', () => deleteLoan(index));
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        loanList.appendChild(li);
    });
    updateLoanSelect();
}



function editLoan(index) {
    const loan = loans[index];
    const newClient = prompt('Ingrese el nuevo cliente', loan.client);
    const newAmount = prompt('Ingrese el nuevo monto', loan.amount);
    const newInterest = prompt('Ingrese el nuevo interés', loan.interest);
    const newTerm = prompt('Ingrese el nuevo plazo', loan.term);
    if (newClient || newAmount || newInterest || newTerm) {
        loan.client = newClient || loan.client;
        loan.amount = newAmount || loan.amount;
        loan.interest = newInterest || loan.interest;
        loan.term = newTerm || loan.term;
        localStorage.setItem('loans', JSON.stringify(loans));
        renderLoans();
    }
}

function deleteLoan(index) {
    loans.splice(index, 1);
    localStorage.setItem('loans', JSON.stringify(loans));
    renderLoans();
}

//            TABLA PAGINACION CREDITOS ACTIVOS

  
const itemsPerPage = 10; // Cantidad de préstamos por página
let currentPage = 1;
  
  // Función para renderizar la tabla de préstamos
function renderLoanTable() {
  console.log()
    const tableBody = document.querySelector('#loanTable tbody');
    tableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const LoanActive = Loan.filter(loan => loan.estado === "Active");
    
    for (let i = startIndex; i < endIndex && i < LoanActive.length; i++) {
      const loan = Loan[i];
      
      const loanPayments = Payment.filter(p => p.loanClientId === loan.id);
    
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${loan.clientId}</td>
        <td>${loan.clientName}</td>
        <td>${loan.loanMode}</td>
        <td>${loan.loanAmount}</td>
        <td>${loan.valorCuota}</td>
        <td>${loan.fecha}</td>
      `;
  
      const paymentRow = document.createElement('tr');
      paymentRow.classList.add('payment-row');
      paymentRow.innerHTML = `
        <td colspan="6">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fecha de Pago</th>
                <th>Monto del Pago</th>
              </tr>
            </thead>
            <tbody>
              ${loanPayments.map(payment => `
                <tr>
                  <td>${payment.loanClientName}</td>
                  <td>${payment.fecha}</td>
                  <td>${payment.pago}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </td>
      `;
  
      row.addEventListener('click', () => {
        paymentRow.classList.toggle('show');
      });
  
      tableBody.appendChild(row);
      tableBody.appendChild(paymentRow);
    }
  
    renderPagination();
}
  
  // Función para renderizar la paginación
function renderPagination() {
    const paginationContainer = document.querySelector('#pagination');
    paginationContainer.innerHTML = '';
  
    const totalPages = Math.ceil(Loan.length / itemsPerPage);
  
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.textContent = i;
      button.addEventListener('click', () => {
        currentPage = i;
        renderLoanTable();
      });
      paginationContainer.appendChild(button);
    }
}
//            TABLA PAGINACION CREDITOS DESACTIVADOS
