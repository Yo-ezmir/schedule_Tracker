document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tracker-form');
    const tableBody = document.getElementById('table-body');
    const dateInput = document.getElementById('date');

    // Default to today's date
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Load local plans
    let plans = JSON.parse(localStorage.getItem('simplePlanTracker')) || [];
    renderTable();

    // Add new plan
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const dateVal = document.getElementById('date').value;
        const autoDay = getDayOfWeek(dateVal);

        const newPlan = {
            id: Date.now().toString(),
            date: dateVal,
            day: autoDay,
            timeSlot: document.getElementById('time-slot').value,
            plannedTask: document.getElementById('planned-task').value,
            weeklyPlan: document.getElementById('weekly-plan').value || '-',
            monthlyPlan: document.getElementById('monthly-plan').value || '-',
            specialTasks: document.getElementById('special-tasks').value || '-',
            // Always default newly added tasks to Not Done
            status: 'Not Done' 
        };

        plans.unshift(newPlan); // Add to beginning of array
        saveAndRender();
        
        // Reset strictly the specific task fields to facilitate faster sequential entry
        document.getElementById('planned-task').value = '';
        document.getElementById('time-slot').value = '';
        document.getElementById('time-slot').focus();
    });

    function getDayOfWeek(dateString) {
        // Parse date considering timezone (create neutral date)
        const parts = dateString.split('-');
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    function renderTable() {
        tableBody.innerHTML = '';
        
        if (plans.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 3rem;">No plans tracked yet. Enter one above to begin.</td></tr>`;
            return;
        }

        plans.forEach(plan => {
            const tr = document.createElement('tr');
            
            // Apply conditional class for the toggle button
            const isDone = plan.status === 'Done';
            const statusClass = isDone ? 'status-done' : 'status-not-done';

            tr.innerHTML = `
                <td>${plan.date}</td>
                <td style="font-weight: 500;">${plan.day}</td>
                <td>${plan.timeSlot}</td>
                <td style="color: var(--text-primary); font-weight: 500;">${plan.plannedTask}</td>
                <td>${plan.weeklyPlan}</td>
                <td>${plan.monthlyPlan}</td>
                <td>${plan.specialTasks}</td>
                <td>
                    <button class="status-btn ${statusClass}" onclick="toggleStatus('${plan.id}')">
                        ${plan.status}
                    </button>
                </td>
                <td>
                    <button class="delete-btn" onclick="deletePlan('${plan.id}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Accessible globally for inline onclick
    window.toggleStatus = (id) => {
        const index = plans.findIndex(p => p.id === id);
        if (index > -1) {
            // Toggle
            plans[index].status = plans[index].status === 'Done' ? 'Not Done' : 'Done';
            saveAndRender();
        }
    };

    window.deletePlan = (id) => {
        plans = plans.filter(p => p.id !== id);
        saveAndRender();
    };

    function saveAndRender() {
        localStorage.setItem('simplePlanTracker', JSON.stringify(plans));
        renderTable();
    }
});
