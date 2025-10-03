// CricketSync Collegiate - Main JavaScript File

// Global variables
let currentPage = 'dashboard';
let matchesData = [];
let teamsData = [];
let playersData = [];
let ticketsData = [];
let currentMatch = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('CricketSync Collegiate initialized');
    initializeApp();
});

// Initialize application
function initializeApp() {
    setupNavigation();
    setupMobileMenu();
    addInteractiveEffects();
    
    // Load data based on current page
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        loadDashboardData();
    } else if (path.includes('ticket-booking.html')) {
        loadTicketBookingData();
    } else if (path.includes('team-ranking.html')) {
        loadTeamRankingData();
    } else if (path.includes('player-ranking.html')) {
        loadPlayerRankingData();
    } else if (path.includes('your-tickets.html')) {
        loadYourTicketsData();
    }
}

// Setup navigation
function setupNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.includes(href) || (currentPath === '/' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
        
        // Close menu when clicking on links
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('show');
            });
        });
    }
}

// Add interactive effects
function addInteractiveEffects() {
    // Card hover effects
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// API Functions
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`php/${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Error: ' + error.message, 'error');
        return null;
    }
}

// Dashboard Functions
async function loadDashboardData() {
    showLoading();
    
    try {
        const [matches, teams, players, tickets] = await Promise.all([
            apiRequest('get_matches.php'),
            apiRequest('get_teams.php'),
            apiRequest('get_players.php'),
            apiRequest('get_tickets.php')
        ]);
        
        if (matches) updateDashboardStats(matches, teams, players, tickets);
        if (matches) displayUpcomingMatches(matches.filter(m => m.match_status === 'upcoming').slice(0, 3));
        if (tickets) displayRecentBookings(tickets.slice(0, 3));
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
    
    hideLoading();
}

function updateDashboardStats(matches, teams, players, tickets) {
    const upcomingMatches = matches.filter(m => m.match_status === 'upcoming').length;
    
    const upcomingEl = document.getElementById('upcoming-matches');
    const teamsEl = document.getElementById('total-teams');
    const playersEl = document.getElementById('total-players');
    const bookingsEl = document.getElementById('total-bookings');
    
    if (upcomingEl) upcomingEl.textContent = upcomingMatches;
    if (teamsEl) teamsEl.textContent = teams ? teams.length : 0;
    if (playersEl) playersEl.textContent = players ? players.length : 0;
    if (bookingsEl) bookingsEl.textContent = tickets ? tickets.length : 0;
}

function displayUpcomingMatches(matches) {
    const container = document.getElementById('upcoming-matches-container');
    if (!container) return;
    
    if (matches.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="padding: 2rem; color: #666;">
                <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No upcoming matches scheduled</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = matches.map(match => `
        <div class="match-card card">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; align-items: center;">
                <div>
                    <h3 class="match-teams">${match.team1} vs ${match.team2}</h3>
                    <div class="match-details">
                        <div><i class="fas fa-calendar"></i> ${formatDate(match.match_date)}</div>
                        <div><i class="fas fa-clock"></i> ${formatTime(match.match_time)}</div>
                        <div><i class="fas fa-map-marker-alt"></i> ${match.venue}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="match-price">₹${formatCurrency(match.ticket_price)}</div>
                    <p style="color: #28a745; margin: 0.5rem 0;">${match.available_seats} seats available</p>
                    <a href="ticket-booking.html" class="btn btn-primary">Book Now</a>
                </div>
            </div>
        </div>
    `).join('');
}

function displayRecentBookings(tickets) {
    const container = document.getElementById('recent-bookings-container');
    if (!container) return;
    
    if (tickets.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="padding: 1rem; color: #666;">
                <p>No recent bookings</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tickets.map(ticket => `
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem;">
            <div style="font-weight: 500; margin-bottom: 0.25rem;">${ticket.match_details}</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #666;">
                <span>${ticket.quantity} tickets</span>
                <span class="currency">₹${formatCurrency(ticket.total_amount)}</span>
            </div>
        </div>
    `).join('');
}

// Ticket Booking Functions
async function loadTicketBookingData() {
    showLoading();
    
    const matches = await apiRequest('get_matches.php');
    if (matches) {
        matchesData = matches.filter(m => m.match_status === 'upcoming');
        displayMatchesForBooking();
    }
    
    hideLoading();
}

function displayMatchesForBooking() {
    const container = document.getElementById('matches-container');
    if (!container) return;
    
    if (matchesData.length === 0) {
        container.innerHTML = `
            <div class="card text-center" style="padding: 3rem;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                <h3>No Upcoming Matches</h3>
                <p style="color: #666;">Check back later for new match announcements</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = matchesData.map(match => `
        <div class="card match-card">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2rem; align-items: center;">
                <div>
                    <h3 class="match-teams">${match.team1} vs ${match.team2}</h3>
                    <div class="match-details">
                        <div><i class="fas fa-calendar"></i> ${formatDate(match.match_date)}</div>
                        <div><i class="fas fa-clock"></i> ${formatTime(match.match_time)}</div>
                        <div><i class="fas fa-map-marker-alt"></i> ${match.venue}</div>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <div class="match-price">₹${formatCurrency(match.ticket_price)}</div>
                    <div style="font-size: 0.9rem; color: #666;">per ticket</div>
                    <div style="font-size: 0.9rem; color: #28a745; margin-top: 0.5rem;">${match.available_seats} seats left</div>
                </div>

                <div style="text-align: right;">
                    ${match.available_seats > 0 ? 
                        `<button class="btn btn-primary" onclick="openBookingModal(${match.id})">
                            <i class="fas fa-ticket-alt"></i> Book Now
                         </button>` : 
                        `<button class="btn btn-danger" disabled>Sold Out</button>`
                    }
                </div>
            </div>
        </div>
    `).join('');
}

function openBookingModal(matchId) {
    const match = matchesData.find(m => m.id == matchId);
    if (!match) {
        showNotification('Match not found', 'error');
        return;
    }
    
    currentMatch = match;
    
    document.getElementById('match_id').value = match.id;
    document.getElementById('match-details').innerHTML = `
        <h4 style="color: #2d6b3d; margin-bottom: 0.5rem;">${match.team1} vs ${match.team2}</h4>
        <p style="margin: 0.25rem 0;"><i class="fas fa-calendar"></i> ${formatDate(match.match_date)}</p>
        <p style="margin: 0.25rem 0;"><i class="fas fa-clock"></i> ${formatTime(match.match_time)}</p>
        <p style="margin: 0.25rem 0;"><i class="fas fa-map-marker-alt"></i> ${match.venue}</p>
        <p style="margin: 0.25rem 0;">Price: <span class="currency">₹${formatCurrency(match.ticket_price)}</span> per ticket</p>
        <p style="margin: 0.25rem 0; color: #28a745;">Available: ${match.available_seats} seats</p>
    `;
    
    // Reset form
    document.getElementById('quantity').value = 1;
    document.getElementById('holder_name').value = '';
    document.getElementById('holder_email').value = '';
    document.getElementById('holder_phone').value = '';
    
    updateBookingTotal();
    
    const modal = document.getElementById('booking-modal');
    modal.classList.add('show');
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    modal.classList.remove('show');
    currentMatch = null;
}

function updateBookingTotal() {
    if (!currentMatch) return;
    
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const total = currentMatch.ticket_price * quantity;
    document.getElementById('total-amount').textContent = '₹' + formatCurrency(total);
}

async function submitBooking(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const bookingData = {
        match_id: formData.get('match_id'),
        quantity: parseInt(formData.get('quantity')),
        holder_name: formData.get('holder_name'),
        holder_email: formData.get('holder_email'),
        holder_phone: formData.get('holder_phone') || ''
    };
    
    // Validate
    if (!bookingData.holder_name || !bookingData.holder_email) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    showButtonLoading(submitBtn);
    
    const result = await apiRequest('book_ticket.php', 'POST', bookingData);
    
    hideButtonLoading(submitBtn);
    
    if (result && result.success) {
        showNotification(`Booking confirmed! Reference: ${result.booking_reference}`, 'success');
        closeBookingModal();
        setTimeout(() => {
            loadTicketBookingData(); // Refresh matches
        }, 1000);
    } else {
        showNotification(result?.error || 'Booking failed. Please try again.', 'error');
    }
}

// Team Ranking Functions
async function loadTeamRankingData() {
    showLoading();
    
    const teams = await apiRequest('get_teams.php');
    if (teams) {
        teamsData = teams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.net_run_rate - a.net_run_rate;
        });
        displayTopTeams();
        displayTeamRankings();
    }
    
    hideLoading();
}

function displayTopTeams() {
    const container = document.getElementById('top-teams-container');
    if (!container || teamsData.length === 0) return;
    
    const topThree = teamsData.slice(0, 3);
    
    container.innerHTML = topThree.map((team, index) => {
        const rankClasses = ['rank-1', 'rank-2', 'rank-3'];
        const medals = ['🥇', '🥈', '🥉'];
        const winPercentage = team.matches_played > 0 ? 
            ((team.matches_won / team.matches_played) * 100).toFixed(1) : 0;
        
        return `
            <div class="stat-card ${rankClasses[index]}">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${medals[index]}</div>
                <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem;">${team.name}</div>
                <div style="font-size: 0.9rem; margin-bottom: 1rem; opacity: 0.8;">${team.college}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold;">${team.points}</div>
                        <div style="font-size: 0.8rem;">Points</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold;">${winPercentage}%</div>
                        <div style="font-size: 0.8rem;">Win Rate</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function displayTeamRankings() {
    const tbody = document.querySelector('#teams-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = teamsData.map((team, index) => {
        const winPercentage = team.matches_played > 0 ? 
            ((team.matches_won / team.matches_played) * 100).toFixed(1) : 0;
        
        return `
            <tr style="${index < 3 ? 'background: rgba(76, 175, 80, 0.1);' : ''}">
                <td>
                    <span class="badge badge-${index < 3 ? 'success' : 'info'}">${index + 1}</span>
                    ${index === 0 ? '<i class="fas fa-crown" style="color: #ffd700; margin-left: 0.5rem;"></i>' : ''}
                </td>
                <td style="font-weight: 600;">${team.name}</td>
                <td style="color: #666;">${team.college}</td>
                <td>${team.captain || '-'}</td>
                <td>${team.matches_played}</td>
                <td style="color: #28a745; font-weight: 500;">${team.matches_won}</td>
                <td style="color: #dc3545;">${team.matches_lost}</td>
                <td>
                    ${winPercentage}%
                    <i class="fas fa-trending-${winPercentage > 50 ? 'up' : 'down'}" 
                       style="color: ${winPercentage > 50 ? '#28a745' : '#dc3545'}; font-size: 0.8rem; margin-left: 0.25rem;"></i>
                </td>
                <td><span class="badge badge-info">${team.points}</span></td>
                <td style="color: ${team.net_run_rate > 0 ? '#28a745' : team.net_run_rate < 0 ? '#dc3545' : '#6c757d'};">
                    ${team.net_run_rate > 0 ? '+' : ''}${parseFloat(team.net_run_rate).toFixed(2)}
                </td>
            </tr>
        `;
    }).join('');
}

// Player Ranking Functions
async function loadPlayerRankingData() {
    showLoading();
    
    const players = await apiRequest('get_players.php');
    if (players) {
        playersData = players;
        displayPlayerRankings('batting'); // Default to batting
    }
    
    hideLoading();
}

function displayPlayerRankings(category = 'batting') {
    let sortedPlayers = [];
    
    switch (category) {
        case 'bowling':
            sortedPlayers = playersData
                .filter(p => p.wickets_taken > 0)
                .sort((a, b) => b.wickets_taken - a.wickets_taken)
                .slice(0, 10);
            break;
        case 'allround':
            sortedPlayers = playersData
                .filter(p => p.runs_scored > 0 && p.wickets_taken > 0)
                .sort((a, b) => (b.runs_scored + b.wickets_taken * 20) - (a.runs_scored + a.wickets_taken * 20))
                .slice(0, 10);
            break;
        default: // batting
            sortedPlayers = playersData
                .filter(p => p.runs_scored > 0)
                .sort((a, b) => b.runs_scored - a.runs_scored)
                .slice(0, 10);
    }
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });
    const activeBtn = document.querySelector(`[onclick*="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('btn-primary');
        activeBtn.classList.remove('btn-secondary');
    }
    
    // Update table
    const tbody = document.querySelector('#players-table tbody');
    const thead = document.querySelector('#players-table thead tr');
    
    if (!tbody || !thead) return;
    
    // Update table headers
    let headers = `
        <th>Rank</th>
        <th>Player</th>
        <th>Team</th>
        <th>Role</th>
        <th>Matches</th>
    `;
    
    if (category === 'batting') {
        headers += '<th>Runs</th><th>Average</th><th>High Score</th>';
    } else if (category === 'bowling') {
        headers += '<th>Wickets</th><th>Average</th><th>Best Bowling</th>';
    } else {
        headers += '<th>Runs</th><th>Wickets</th><th>Bat Avg</th><th>Bowl Avg</th>';
    }
    
    thead.innerHTML = headers;
    
    // Update table body
    tbody.innerHTML = sortedPlayers.map((player, index) => {
        const roleColors = {
            'batsman': 'badge-info',
            'bowler': 'badge-danger',
            'all_rounder': 'badge-success',
            'wicket_keeper': 'badge-warning'
        };
        
        let statsColumns = '';
        if (category === 'batting') {
            statsColumns = `
                <td style="color: #28a745; font-weight: bold; font-size: 1.1rem;">${player.runs_scored}</td>
                <td>${parseFloat(player.batting_average).toFixed(2)}</td>
                <td style="font-weight: 500;">${player.highest_score}</td>
            `;
        } else if (category === 'bowling') {
            statsColumns = `
                <td style="color: #dc3545; font-weight: bold; font-size: 1.1rem;">${player.wickets_taken}</td>
                <td>${parseFloat(player.bowling_average).toFixed(2)}</td>
                <td style="font-weight: 500;">${player.best_bowling || '-'}</td>
            `;
        } else {
            statsColumns = `
                <td style="color: #28a745; font-weight: 500;">${player.runs_scored}</td>
                <td style="color: #dc3545; font-weight: 500;">${player.wickets_taken}</td>
                <td>${parseFloat(player.batting_average).toFixed(2)}</td>
                <td>${parseFloat(player.bowling_average).toFixed(2)}</td>
            `;
        }
        
        return `
            <tr style="${index === 0 ? 'background: rgba(255, 215, 0, 0.1);' : (index < 3 ? 'background: rgba(76, 175, 80, 0.1);' : '')}">
                <td>
                    <span class="badge badge-${index < 3 ? 'success' : 'info'}">${index + 1}</span>
                    ${index === 0 ? '<i class="fas fa-crown" style="color: #ffd700; margin-left: 0.5rem;"></i>' : ''}
                </td>
                <td style="font-weight: 600;">${player.name}</td>
                <td>${player.team}</td>
                <td><span class="badge ${roleColors[player.role]}">${player.role.replace('_', ' ').toUpperCase()}</span></td>
                <td>${player.matches_played}</td>
                ${statsColumns}
            </tr>
        `;
    }).join('');
}

// Your Tickets Functions
async function loadYourTicketsData() {
    showLoading();
    
    const tickets = await apiRequest('get_tickets.php');
    if (tickets) {
        ticketsData = tickets;
        displayTicketStats();
        displayTickets();
    }
    
    hideLoading();
}

function displayTicketStats() {
    const totalBookings = ticketsData.length;
    const totalTickets = ticketsData.reduce((sum, ticket) => sum + parseInt(ticket.quantity), 0);
    const totalAmount = ticketsData.reduce((sum, ticket) => sum + parseFloat(ticket.total_amount), 0);
    
    const bookingsEl = document.getElementById('total-bookings');
    const ticketsEl = document.getElementById('total-tickets');
    const spentEl = document.getElementById('total-spent');
    
    if (bookingsEl) bookingsEl.textContent = totalBookings;
    if (ticketsEl) ticketsEl.textContent = totalTickets;
    if (spentEl) spentEl.textContent = '₹' + formatCurrency(totalAmount);
}

function displayTickets() {
    const container = document.getElementById('tickets-container');
    if (!container) return;
    
    if (ticketsData.length === 0) {
        container.innerHTML = `
            <div class="card text-center" style="padding: 3rem;">
                <i class="fas fa-ticket-alt" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                <h3>No Tickets Yet</h3>
                <p style="color: #666; margin-bottom: 2rem;">You haven't booked any tickets yet. Start by booking tickets for upcoming matches.</p>
                <a href="ticket-booking.html" class="btn btn-primary">Book Your First Ticket</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = ticketsData.map(ticket => {
        const statusColors = {
            'confirmed': 'badge-success',
            'pending': 'badge-warning',
            'cancelled': 'badge-danger'
        };
        
        return `
            <div class="card ticket-card">
                <div style="display: flex; background: white; border-radius: 15px; overflow: hidden;">
                    <div class="ticket-content" style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div>
                                <h3 style="color: #2d6b3d; font-size: 1.3rem; margin-bottom: 0.5rem;">${ticket.match_details}</h3>
                                <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: #666; margin-bottom: 1rem;">
                                    <span><i class="fas fa-calendar"></i> Booked on ${formatDate(ticket.created_at)}</span>
                                    <span><i class="fas fa-users"></i> ${ticket.quantity} ${ticket.quantity == 1 ? 'ticket' : 'tickets'}</span>
                                </div>
                            </div>
                            <span class="badge ${statusColors[ticket.booking_status]}">
                                <i class="fas fa-${ticket.booking_status === 'confirmed' ? 'check-circle' : ticket.booking_status === 'pending' ? 'clock' : 'times-circle'}"></i>
                                ${ticket.booking_status.toUpperCase()}
                            </span>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; font-size: 0.9rem;">
                            <div>
                                <div style="color: #666; margin-bottom: 0.25rem;">Booking Reference</div>
                                <div style="font-family: monospace; font-weight: 500; background: #f8f9fa; padding: 0.25rem 0.5rem; border-radius: 4px;">${ticket.booking_reference}</div>
                            </div>
                            <div>
                                <div style="color: #666; margin-bottom: 0.25rem;">Seat Numbers</div>
                                <div style="font-weight: 500;">${ticket.seat_numbers || 'TBA'}</div>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="currency" style="font-size: 1.5rem; font-weight: bold;">₹${formatCurrency(ticket.total_amount)}</div>
                            <button class="btn btn-secondary" onclick='downloadTicket(${JSON.stringify({
                                reference: ticket.booking_reference,
                                details: ticket.match_details,
                                quantity: ticket.quantity,
                                seats: ticket.seat_numbers,
                                amount: ticket.total_amount
                            })})'>
                                <i class="fas fa-download"></i> Download
                            </button>
                        </div>
                    </div>

                    <div class="ticket-stub">
                        <div style="text-align: center;">
                            <i class="fas fa-ticket-alt" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                            <div style="font-size: 0.8rem; font-weight: bold; margin-bottom: 0.25rem;">ADMIT</div>
                            <div style="font-size: 1.5rem; font-weight: bold;">${ticket.quantity}</div>
                            <div style="font-size: 0.7rem; opacity: 0.8; margin-top: 0.5rem;">CRICKETSYNC</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Modified downloadTicket function to generate PDF using jsPDF
function downloadTicket(ticketData) {
    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        showNotification('PDF library not loaded. Please refresh the page.', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set font and margins
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CRICKETSYNC COLLEGIATE', 105, 20, { align: 'center' });

    // Add a line
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING CONFIRMATION', 105, 35, { align: 'center' });

    // Ticket details
    let yPosition = 50;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    doc.text(`Booking Reference: ${ticketData.reference}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Match: ${ticketData.details}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Quantity: ${ticketData.quantity} ticket${ticketData.quantity > 1 ? 's' : ''}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Seats: ${ticketData.seats || 'TBA'}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total Amount: ₹${formatCurrency(ticketData.amount)}`, 20, yPosition);
    yPosition += 8;
    doc.text('Status: CONFIRMED', 20, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'italic');
    doc.text(`Booked on: ${new Date().toLocaleDateString('en-IN')}`, 20, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for choosing CricketSync Collegiate!', 105, yPosition, { align: 'center' });
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Please bring this ticket and a valid ID to the venue.', 105, yPosition, { align: 'center' });

    // Save the PDF
    const filename = `ticket-${ticketData.reference}.pdf`;
    doc.save(filename);

    showNotification('Ticket download  successfully!', 'success');
}

// Utility Functions
function formatCurrency(amount) {
    if (!amount) return '0';
    return parseInt(amount).toLocaleString('en-IN');
}

function formatDate(dateString) {
    if (!dateString) return 'Date not available';
    
    try {
        // Handle both date formats from database
        let date;
        if (dateString.includes('T')) {
            date = new Date(dateString);
        } else {
            // Handle MySQL date format (YYYY-MM-DD)
            const parts = dateString.split(' ')[0].split('-');
            date = new Date(parts[0], parts[1] - 1, parts[2]);
        }
        
        if (isNaN(date.getTime())) {
            return dateString; // Return original if parsing fails
        }
        
        return date.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (e) {
        console.error('Date formatting error:', e);
        return dateString;
    }
}

function formatTime(timeString) {
    if (!timeString) return 'Time not available';
    
    try {
        // Handle HH:MM:SS format
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            let hours = parseInt(parts[0]);
            const minutes = parts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${hours}:${minutes} ${ampm}`;
        }
        return timeString;
    } catch (e) {
        console.error('Time formatting error:', e);
        return timeString;
    }
}

function showLoading() {
    const existing = document.getElementById('loading-overlay');
    if (existing) return;
    
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(255,255,255,0.9); display: flex; justify-content: center; 
                    align-items: center; z-index: 9999;">
            <div style="text-align: center;">
                <div class="loading" style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #4caf50; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: #666; font-weight: 500; margin-top: 1rem;">Loading...</p>
            </div>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.remove();
    }
}

function showButtonLoading(button) {
    if (!button) return;
    button.originalText = button.innerHTML;
    button.innerHTML = '<span class="loading" style="display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3); border-top: 2px solid #fff; border-radius: 50%; animation: spin 1s linear infinite;"></span> Processing...';
    button.disabled = true;
}

function hideButtonLoading(button) {
    if (!button) return;
    if (button.originalText) {
        button.innerHTML = button.originalText;
        button.disabled = false;
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

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('booking-modal');
    if (modal && event.target === modal) {
        closeBookingModal();
    }
}
