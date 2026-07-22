import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
// ==========================================
// Firebase Config
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyC2zqF5at3r8eKG0Q7frxnS-byD1OW-vto",
  authDomain: "carcarepro-daf80.firebaseapp.com",
  projectId: "carcarepro-daf80",
  storageBucket: "carcarepro-daf80.firebasestorage.app",
  messagingSenderId: "1014143359387",
  appId: "1:1014143359387:web:d3ab7e58dcc73af4b8a93e",
  measurementId: "G-5C1H0RZ9HY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// Service Prices
// ==========================================

let servicePrice = {};

async function loadServicePrices(){

    const ref = doc(db,"settings","servicePrices");

    const snap = await getDoc(ref);

    if(snap.exists()){

        servicePrice = snap.data();

    }else{

        servicePrice={

            "Oil Change":1000,
            "Engine Oil Replacement":1500,
            "Oil Filter Change":400,
            "Air Filter Cleaning":300,
            "Wheel Alignment":800,
            "Engine Checkup":1200,
            "Battery Check":700,
            "Tyre Inspection":500,
            "Pick-up & Drop":300,

            "Car Wash":500,
            "Interior Cleaning":700,
            "Exterior Polishing":1200,
            "Vacuum Cleaning":400,
            "Ceramic Coating":5000,

            "Engine Diagnostics":1800,
            "Spark Plug Replacement":1200,
            "Fuel System Cleaning":1500,

            "AC Gas Refill":1800,
            "AC Filter Cleaning":600,
            "Cooling Performance Check":500,
            "AC Service":2000,

            "Brake Inspection":700,
            "Brake Pad Replacement":2500,
            "Tyre Replacement":6000,
            "Battery Charging":500,
            "Battery Replacement":4500,

            "Dent & Paint Work":7000,
            "Car Detailing":6000,
            "Anti-Rust Treatment":2500

        };

        await setDoc(ref,servicePrice);

    }

}

// ==========================================
// Price Table
// ==========================================

function loadPriceTable(){

const table = document.getElementById("priceTable");

table.innerHTML = "";

for(const service in servicePrice){

table.innerHTML += `

<div class="price-card">

<h3>${service}</h3>

<input
type="number"
id="${service}"
value="${servicePrice[service]}">

<button onclick="savePrice('${service}')">
Save Price
</button>

</div>

`;

}

}

// ==========================================
// Save Price
// ==========================================

window.savePrice = async function(service){

const value=Number(
document.getElementById(service).value
);

servicePrice[service]=value;

await setDoc(

doc(db,"settings","servicePrices"),

servicePrice

);

alert(service+" price updated successfully.");

loadService();

}

// ==========================================
// Change Booking Status
// ==========================================

window.changeStatus = async function(id,status){

    await updateDoc(
        doc(db,"serviceBookings",id),
        {
            status:status
        }
    );

    loadService();

};

// ==========================================
// Customers
// ==========================================

async function loadCustomers(){

    const snap = await getDocs(collection(db,"customers"));

    const table = document.getElementById("customersTable");

    table.innerHTML = `

    <tr>
        <th>Name</th>
        <th>Phone</th>
        <th>Date</th>
        <th>Action</th>
    </tr>

    `;

    document.getElementById("customerCount").innerHTML = snap.size;

    snap.forEach((item)=>{

        const d = item.data();

        let date = "";

        if(d.createdAt){

            if(d.createdAt.seconds){

                date = new Date(
                    d.createdAt.seconds*1000
                ).toLocaleString();

            }else{

                date = new Date(
                    d.createdAt
                ).toLocaleString();

            }

        }

        table.innerHTML += `

        <tr>

            <td>${d.name}</td>

            <td>${d.phone}</td>

            <td>${date}</td>

            <td>

                <button onclick="deleteCustomer('${item.id}')">
                    Delete
                </button>

            </td>

        </tr>

        `;

    });

}

// ==========================================
// Delete Customer
// ==========================================

window.deleteCustomer = async function(id){

    if(confirm("Delete this customer?")){

        await deleteDoc(
            doc(db,"customers",id)
        );

        loadCustomers();

    }

};

// ==========================================
// Service Booking
// ==========================================

async function loadService(){

    const snap = await getDocs(
        collection(db,"serviceBookings")
    );

    const table = document.getElementById("serviceTable");

    table.innerHTML = `

    <tr>

        <th>Vehicle</th>
        <th>Owner</th>
        <th>Phone</th>
        <th>Date</th>
        <th>Time</th>
        <th>Services</th>
        <th>Status</th>
        <th>Action</th>

    </tr>

    `;

    document.getElementById("serviceCount").innerHTML =
    snap.size;

    let revenue = 0;

    let pending = 0;

    let completed = 0;

    let todayBooking = 0;

    const today = new Date()
    .toISOString()
    .split("T")[0];

    snap.forEach((item)=>{

        const d = item.data();

        const status = d.status || "Pending";

        let total = 0;

        if(Array.isArray(d.services)){

    d.services.forEach(service => {

        if(servicePrice[service]){
            total += servicePrice[service];
        }

    });

}

        revenue += total;

        if(status==="Completed"){

            completed++;

        }else{

            pending++;

        }

        if(d.serviceDate===today){

            todayBooking++;

        }
                table.innerHTML += `

        <tr>

            <td>${d.vehicleNo}</td>

            <td>${d.ownerName}</td>

            <td>${d.phoneNo}</td>

            <td>${d.serviceDate}</td>

            <td>${d.serviceTime}</td>

           <td>${Array.isArray(d.services) ? d.services.join(", ") : "No Service"}</td>

           <td>₹${total}</td>

            <td>

                <select onchange="changeStatus('${item.id}',this.value)">

                    <option value="Pending"
                    ${status=="Pending"?"selected":""}>
                    Pending
                    </option>

                    <option value="Completed"
                    ${status=="Completed"?"selected":""}>
                    Completed
                    </option>

                </select>

            </td>

            <td>

                <button onclick="deleteService('${item.id}')">
                    Delete
                </button>

            </td>

        </tr>

        `;

    });

    // Dashboard Cards

    document.getElementById("revenueCount").innerHTML =
    "₹" + revenue;

    document.getElementById("todayBookingCount").innerHTML =
    todayBooking;

    document.getElementById("pendingCount").innerHTML =
    pending + " / " + completed;

}

// ==========================================
// Delete Service
// ==========================================

window.deleteService = async function(id){

    if(confirm("Delete this Service Booking?")){

        await deleteDoc(
            doc(db,"serviceBookings",id)
        );

        loadService();

    }

};

// ==========================================
// Test Drive
// ==========================================

async function loadTestDrive(){

    const snap = await getDocs(
        collection(db,"testDriveBookings")
    );

    const table =
    document.getElementById("testTable");

    table.innerHTML = `

    <tr>

        <th>Name</th>
        <th>Phone</th>
        <th>Vehicle</th>
        <th>Date</th>
        <th>Time</th>
        <th>Action</th>

    </tr>

    `;

    document.getElementById("testCount").innerHTML =
    snap.size;

    snap.forEach((item)=>{

        const d = item.data();

        table.innerHTML += `

        <tr>

            <td>${d.testName}</td>

            <td>${d.testPhone}</td>

            <td>${d.vehicle}</td>

            <td>${d.testDate}</td>

            <td>${d.testTime}</td>

            <td>

                <button onclick="deleteTest('${item.id}')">
                    Delete
                </button>

            </td>

        </tr>

        `;

    });

}

// ==========================================
// Delete Test Drive
// ==========================================

window.deleteTest = async function(id){

    if(confirm("Delete Test Drive Booking?")){

        await deleteDoc(
            doc(db,"testDriveBookings",id)
        );

        loadTestDrive();

    }

};

// ==========================================
// Emergency Requests
// ==========================================

async function loadEmergency(){

    const snap = await getDocs(
        collection(db,"emergencyRequests")
    );

    const table =
    document.getElementById("emergencyTable");

    table.innerHTML = `

    <tr>

        <th>Vehicle</th>
        <th>Owner</th>
        <th>Phone</th>
        <th>Location</th>
        <th>Problem</th>
        <th>Action</th>

    </tr>

    `;

    document.getElementById("emergencyCount").innerHTML =
    snap.size;

    snap.forEach((item)=>{

        const d = item.data();

        table.innerHTML += `

        <tr>

            <td>${d.vehicleNo}</td>

            <td>${d.ownerName}</td>

            <td>${d.phoneNo}</td>

            <td>${d.location}</td>

            <td>${d.problem}</td>

            <td>

                <button onclick="deleteEmergency('${item.id}')">
                    Delete
                </button>

            </td>

        </tr>

        `;

    });

}

// ==========================================
// Delete Emergency
// ==========================================

window.deleteEmergency = async function(id){

    if(confirm("Delete Emergency Request?")){

        await deleteDoc(
            doc(db,"emergencyRequests",id)
        );

        loadEmergency();

    }

};
// ==========================================
// Customer Feedback
// ==========================================

async function loadFeedback(){

    const snap = await getDocs(
        collection(db,"customerFeedback")
    );

    const table =
    document.getElementById("feedbackTable");

    table.innerHTML = `

    <tr>

        <th>Name</th>
        <th>Rating</th>
        <th>Feedback</th>
        <th>Action</th>

    </tr>

    `;

    document.getElementById("feedbackCount").innerHTML =
    snap.size;

    snap.forEach((item)=>{

        const d = item.data();

        table.innerHTML += `

        <tr>

            <td>${d.name}</td>

            <td>${d.rating}</td>

            <td>${d.message}</td>

            <td>

                <button onclick="deleteFeedback('${item.id}')">
                    Delete
                </button>

            </td>

        </tr>

        `;

    });

}

// ==========================================
// Delete Feedback
// ==========================================

window.deleteFeedback = async function(id){

    if(confirm("Delete this Feedback?")){

        await deleteDoc(
            doc(db,"customerFeedback",id)
        );

        loadFeedback();

    }

};

// ==========================================
// Refresh Dashboard
// ==========================================

window.refreshDashboard = function(){

    loadCustomers();

    loadService();

    loadTestDrive();

    loadEmergency();

    loadFeedback();

    alert("Dashboard Refreshed Successfully");

};

// ==========================================
// Search Feature
// ==========================================

const searchBox = document.getElementById("search");

if(searchBox){

searchBox.addEventListener("keyup",function(){

const value = this.value.toLowerCase();

const tables = document.querySelectorAll("table");

tables.forEach(table=>{

const rows = table.querySelectorAll("tr");

rows.forEach((row,index)=>{

if(index===0) return;

if(row.innerText.toLowerCase().includes(value)){

row.style.display="";

}else{

row.style.display="none";

}

});

});

});

}

// ==========================================
// Load Dashboard
// ==========================================

async function startManager(){

    await loadServicePrices();

    loadPriceTable();

    await loadCustomers();

    await loadService();

    await loadTestDrive();

    await loadEmergency();

    await loadFeedback();

    console.log("Manager Loaded Successfully");

}

startManager();