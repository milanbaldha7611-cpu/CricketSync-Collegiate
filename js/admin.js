// Admin Panel JavaScript

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadDashboardStats();
    loadAllData();
});

// Check if admin is authenticated
async function checkAuth() {
    try {
        const response = await fetch('php/admin_auth.php?check=1');
        const result = await response.json();
        
        if (!result.authenticated) {
            window.location.href = 'admin-login.html';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'admin-login.html';
    }
}

// Show different sections
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section + '-section').classList.add('active');
    
    // Update active menu item
    document.querySelectorAll('.admin-menu a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load data for specific sections
    if (section === 'matches') loadMatches();
    if (section === 'teams') loadTeams();
    if (section === 'players') loadPlayers();
}

// Load Dashboard Statistics
async function loadDashboardStats() {
    try {
        const [matches, teams, players, tickets] = await Promise.all([
            fetch('php/get_matches.php').then(r => r.json()),
            fetch('php/get_teams.php').then(r => r.json()),
            fetch('php/get_players.php').then(r => r.json()),
            fetch('php/get_tickets.php').then(r => r.json())
        ]);
        
        document.getElementById('stat-matches').textContent = matches.length;
        document.getElementById('stat-teams').textContent = teams.length;
        document.getElementById('stat-players').textContent = players.length;
        document.getElementById('stat-tickets').textContent = tickets.length;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load all data
function loadAllData() {
    loadMatches();
    loadTeams();
    loadPlayers();
}

// Handle Match Form Submit
async function handleMatchSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Set available_seats equal to total_seats for new match
    data.available_seats = data.total_seats;
    
    try {
        const response = await fetch('php/add_match.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Match added successfully!', 'success');
            event.target.reset();
            loadMatches();
            loadDashboardStats();
        } else {
            showNotification(result.message || 'Error adding match', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// Load Matches
async function loadMatches() {
    try {
        const response = await fetch('php/get_matches.php');
        const matches = await response.json();
        
        const tbody = document.querySelector('#matches-table tbody');
        tbody.innerHTML = matches.map(match => `
            <tr>
                <td>${match.id}</td>
                <td><strong>${match.team1}</strong> vs <strong>${match.team2}</strong></td>
                <td>${formatDate(match.match_date)}<br><small>${formatTime(match.match_time)}</small></td>
                <td>${match.venue}</td>
                <td><span class="badge badge-${match.match_status === 'upcoming' ? 'info' : match.match_status === 'live' ? 'warning' : 'success'}">${match.match_status.toUpperCase()}</span></td>
                <td>₹${parseInt(match.ticket_price).toLocaleString('en-IN')}</td>
                <td>${match.available_seats}/${match.total_seats}</td>
                <td>
                    <button class="btn-action btn-delete" onclick="deleteMatch(${match.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading matches:', error);
    }
}

// Delete Match
async function deleteMatch(id) {
    if (!confirm('Are you sure you want to delete this match?')) return;
    
    try {
        const response = await fetch('php/delete_match.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Match deleted successfully!', 'success');
            loadMatches();
            loadDashboardStats();
        } else {
            showNotification(result.message || 'Error deleting match', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// Handle Team Form Submit
async function handleTeamSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('php/add_team.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Team added successfully!', 'success');
            event.target.reset();
            loadTeams();
            loadDashboardStats();
        } else {
            showNotification(result.message || 'Error adding team', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// Load Teams
async function loadTeams() {
    try {
        const response = await fetch('php/get_teams.php');
        const teams = await response.json();
        
        // Sort by points and NRR
        teams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.net_run_rate - a.net_run_rate;
        });
        
        const tbody = document.querySelector('#teams-table tbody');
        tbody.innerHTML = teams.map((team, index) => `
            <tr>
                <td><strong>#${index + 1}</strong></td>
                <td><strong>${team.name}</strong></td>
                <td>${team.college}</td>
                <td>${team.matches_played}</td>
                <td style="color: #28a745;">${team.matches_won}</td>
                <td style="color: #dc3545;">${team.matches_lost}</td>
                <td><span class="badge badge-info">${team.points}</span></td>
                <td style="color: ${parseFloat(team.net_run_rate) > 0 ? '#28a745' : '#dc3545'};">
                    ${parseFloat(team.net_run_rate).toFixed(2)}
                </td>
                <td>
                    <button class="btn-action btn-delete" onclick="deleteTeam(${team.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading teams:', error);
    }
}

// Delete Team
async function deleteTeam(id) {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
        const response = await fetch('php/delete_team.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Team deleted successfully!', 'success');
            loadTeams();
            loadDashboardStats();
        } else {
            showNotification(result.message || 'Error deleting team', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// Handle Player Form Submit
async function handlePlayerSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('php/add_player.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Player added successfully!', 'success');
            event.target.reset();
            loadPlayers();
            loadDashboardStats();
        } else {
            showNotification(result.message || 'Error adding player', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// Load Players
async function loadPlayers() {
    try {
        const response = await fetch('php/get_players.php');
        const players = await response.json();
        
        const tbody = document.querySelector('#players-table tbody');
        tbody.innerHTML = players.map(player => {
            const roleColors = {
                'batsman': 'info',
                'bowler': 'danger',
                'all_rounder': 'success',
                'wicket_keeper': 'warning'
            };
            
            return `
                <tr>
                    <td>${player.id}</td>
                    <td><strong>${player.name}</strong></td>
                    <td>${player.team}</td>
                    <td><span class="badge badge-${roleColors[player.role]}">${player.role.replace('_', ' ').toUpperCase()}</span></td>
                    <td>${player.matches_played}</td>
                    <td style="color: #28a745;">${player.runs_scored}</td>
                    <td style="color: #dc3545;">${player.wickets_taken}</td>
                    <td>
                        <button class="btn-action btn-delete" onclick="deletePlayer(${player.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading players:', error);
    }
}

// Delete Player
async function deletePlayer(id) {
    if (!confirm('Are you sure you want to delete this player?')) return;
    
    try {
        const response = await fetch('php/delete_player.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Player deleted successfully!', 'success');
            loadPlayers();
            loadDashboardStats();
        } else {
            showNotification(result.message || 'Error deleting player', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// Handle Rankings Update
async function handleRankingsUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('php/update_rankings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Rankings updated successfully!', 'success');
            event.target.reset();
            loadTeams();
        } else {
            showNotification(result.message || 'Error updating rankings', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// Logout
async function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    try {
        await fetch('php/admin_auth.php?logout=1');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const parts = dateString.split(' ')[0].split('-');
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
}

function formatTime(timeString) {
    if (!timeString) return 'N/A';
    try {
        const parts = timeString.split(':');
        let hours = parseInt(parts[0]);
        const minutes = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    } catch (e) {
        return timeString;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#007bff'
    };
    
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        padding: 1rem 1.5rem; border-radius: 8px; color: white; font-weight: 500;
        background: ${colors[type] || colors.info};
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        transform: translateX(100%); transition: transform 0.3s ease;
        max-width: 350px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

