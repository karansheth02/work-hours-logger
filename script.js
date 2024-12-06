import { googleSignIn, signUp, signIn, saveWorkHours, getWorkHours, getBiweeklyWorkHours, userSignOut, auth } from "./firebase.js";

const HOURLY_RATE = 17.2;

// Log Work Hours
document.getElementById("logHoursForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = document.getElementById("date").value;
    const hours = parseFloat(document.getElementById("hours").value);

    if (!date || isNaN(hours) || hours <= 0) {
        alert("Please enter valid details.");
        return;
    }

    try {
        await saveWorkHours(date, hours);
        alert("Work hours logged successfully!");
        document.getElementById("logHoursForm").reset();
        displayWorkHours();
        calculateTotalHoursAndSalary();
        displayBiweeklyReport();
    } catch (error) {
        alert("Failed to log work hours: " + error.message);
    }
});

// Display Work Hours
async function displayWorkHours() {
    const logs = await getWorkHours();
    const workLogsContainer = document.getElementById("workLogs");
    workLogsContainer.innerHTML = logs.map(
        (log) => `<div><strong>Date:</strong> ${log.date} | <strong>Hours:</strong> ${log.hours}</div>`
    ).join("") || "<p>No work logs found.</p>";
}

// Calculate Total Hours and Salary
async function calculateTotalHoursAndSalary() {
    const logs = await getWorkHours();
    const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);
    const totalSalary = totalHours * HOURLY_RATE;

    const summaryContainer = document.getElementById("workSummary");
    summaryContainer.innerHTML = `
        <p><strong>Total Hours Worked:</strong> ${totalHours.toFixed(2)} hours</p>
        <p><strong>Total Expected Salary:</strong> $${totalSalary.toFixed(2)}</p>
    `;
}

// Display Biweekly Report
async function displayBiweeklyReport() {
    const logs = await getBiweeklyWorkHours();
    const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);
    const totalSalary = totalHours * HOURLY_RATE;

    const reportContainer = document.getElementById("biweeklyReport");
    reportContainer.innerHTML = `
        <p><strong>Biweekly Total Hours:</strong> ${totalHours.toFixed(2)} hours</p>
        <p><strong>Biweekly Total Salary:</strong> $${totalSalary.toFixed(2)}</p>
    `;
}

// Display Work Hours Chart
async function displayWorkHoursChart() {
    const logs = await getWorkHours();
    const dates = logs.map((log) => log.date);
    const hours = logs.map((log) => log.hours);

    const ctx = document.getElementById("workHoursChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: dates,
            datasets: [{
                label: "Hours Worked",
                data: hours,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

// Authentication State
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById("auth").style.display = "none";
        document.querySelector("main").style.display = "block";
        document.getElementById("signOutButton").style.display = "block"; // Show Sign Out button
        displayWorkHours();
        calculateTotalHoursAndSalary();
        displayBiweeklyReport();
        displayWorkHoursChart();
    } else {
        document.getElementById("auth").style.display = "block";
        document.querySelector("main").style.display = "none";
        document.getElementById("signOutButton").style.display = "none"; // Hide Sign Out button
        resetAppState();
    }
});

// Reset App State
function resetAppState() {
    document.getElementById("logHoursForm").reset();
    document.getElementById("workLogs").innerHTML = "";
    document.getElementById("workSummary").innerHTML = "";
    document.getElementById("biweeklyReport").innerHTML = "";
}

// Event Listeners for Authentication Buttons
document.getElementById("showSignUp").addEventListener("click", () => {
    document.getElementById("signUpForm").style.display = "block";
    document.getElementById("signInForm").style.display = "none";
});

document.getElementById("showSignIn").addEventListener("click", () => {
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById("signInForm").style.display = "block";
});

document.getElementById("googleSignInButton").addEventListener("click", async () => {
    try {
        const user = await googleSignIn();
        alert(`Welcome ${user.displayName || user.email}`);
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        alert("Google Sign-In failed: " + error.message);
    }
});

document.getElementById("signUpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signUpEmail").value;
    const password = document.getElementById("signUpPassword").value;

    try {
        await signUp(email, password);
        alert("Sign up successful! You can now sign in.");
        document.getElementById("signUpForm").reset();
    } catch (error) {
        console.error("Sign-Up Error:", error);
        alert("Sign-Up failed: " + error.message);
    }
});

document.getElementById("signInForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signInEmail").value;
    const password = document.getElementById("signInPassword").value;

    try {
        await signIn(email, password);
        alert("Sign in successful!");
        document.getElementById("signInForm").reset();
    } catch (error) {
        console.error("Sign-In Error:", error);
        alert("Sign-In failed: " + error.message);
    }
});

document.getElementById("signOutButton").addEventListener("click", async () => {
    try {
        await userSignOut();
        alert("You have successfully signed out.");
    } catch (error) {
        console.error("Sign-Out Error:", error);
        alert("Failed to sign out: " + error.message);
    }
});
