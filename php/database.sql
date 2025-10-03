-- Teams Table
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    college VARCHAR(200) NOT NULL,
    captain VARCHAR(100),
    coach VARCHAR(100),
    matches_played INT DEFAULT 0,
    matches_won INT DEFAULT 0,
    matches_lost INT DEFAULT 0,
    points INT DEFAULT 0,
    net_run_rate DECIMAL(4,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Players Table
CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    team VARCHAR(100) NOT NULL,
    college VARCHAR(200) NOT NULL,
    role ENUM('batsman', 'bowler', 'all_rounder', 'wicket_keeper') NOT NULL,
    matches_played INT DEFAULT 0,
    runs_scored INT DEFAULT 0,
    wickets_taken INT DEFAULT 0,
    batting_average DECIMAL(5,2) DEFAULT 0.00,
    bowling_average DECIMAL(5,2) DEFAULT 0.00,
    highest_score INT DEFAULT 0,
    best_bowling VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches Table
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team1 VARCHAR(100) NOT NULL,
    team2 VARCHAR(100) NOT NULL,
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    venue VARCHAR(200) NOT NULL,
    ticket_price DECIMAL(8,2) NOT NULL,
    available_seats INT NOT NULL,
    total_seats INT NOT NULL,
    match_status ENUM('upcoming', 'live', 'completed') DEFAULT 'upcoming',
    team1_score VARCHAR(50),
    team2_score VARCHAR(50),
    winner VARCHAR(100),
    match_summary TEXT,
    man_of_match VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets Table
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT,
    match_details VARCHAR(300) NOT NULL,
    quantity INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    seat_numbers VARCHAR(100),
    booking_status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'confirmed',
    holder_name VARCHAR(100) NOT NULL,
    holder_email VARCHAR(100) NOT NULL,
    holder_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id)
);

-- Insert default admin (username: admin, password: admin123)
INSERT INTO admin_users (username, password, full_name, email) VALUES
('admin', 'admin123', 'Admin User', 'admin@cricketsync.com');

-- Insert Sample Teams
INSERT INTO teams (name, college, captain, coach, matches_played, matches_won, matches_lost, points, net_run_rate) VALUES
('Delhi Warriors', 'Delhi University', 'Arjun Sharma', 'Rajesh Kumar', 8, 6, 2, 12, 1.45),
('Mumbai Titans', 'Mumbai University', 'Rohit Patel', 'Suresh Gupta', 8, 5, 3, 10, 0.87),
('Chennai Champions', 'Anna University', 'Karthik Raja', 'Venkat Raman', 8, 4, 4, 8, 0.23),
('Bangalore Bulls', 'Bangalore Institute', 'Vikas Reddy', 'Anil Kumble', 8, 3, 5, 6, -0.56),
('Hyderabad Hawks', 'University of Hyderabad', 'Suresh Kumar', 'Mohammad Azhar', 8, 2, 6, 4, -1.12);

-- Insert Sample Players
INSERT INTO players (name, team, college, role, matches_played, runs_scored, wickets_taken, batting_average, bowling_average, highest_score, best_bowling) VALUES
('Arjun Sharma', 'Delhi Warriors', 'Delhi University', 'batsman', 8, 456, 2, 57.00, 35.50, 89, '2/25'),
('Rohit Patel', 'Mumbai Titans', 'Mumbai University', 'all_rounder', 8, 389, 15, 48.62, 18.67, 78, '4/23'),
('Karthik Raja', 'Chennai Champions', 'Anna University', 'wicket_keeper', 8, 334, 0, 41.75, 0.00, 65, ''),
('Vikas Reddy', 'Bangalore Bulls', 'Bangalore Institute', 'bowler', 8, 67, 18, 8.37, 16.33, 25, '5/34'),
('Suresh Kumar', 'Hyderabad Hawks', 'University of Hyderabad', 'batsman', 8, 298, 3, 37.25, 28.33, 72, '2/31'),
('Amit Singh', 'Delhi Warriors', 'Delhi University', 'bowler', 8, 45, 22, 5.62, 15.45, 18, '6/25'),
('Ravi Jadeja', 'Mumbai Titans', 'Mumbai University', 'all_rounder', 8, 245, 12, 30.62, 22.75, 56, '3/18'),
('Dinesh Kumar', 'Chennai Champions', 'Anna University', 'batsman', 8, 267, 1, 33.37, 45.00, 61, '1/12');

-- Insert Sample Matches
INSERT INTO matches (team1, team2, match_date, match_time, venue, ticket_price, available_seats, total_seats) VALUES
('Delhi Warriors', 'Mumbai Titans', '2024-02-15', '14:00:00', 'Feroz Shah Kotla Ground', 150.00, 250, 300),
('Chennai Champions', 'Bangalore Bulls', '2024-02-18', '10:00:00', 'M.A. Chidambaram Stadium', 120.00, 180, 200),
('Delhi Warriors', 'Chennai Champions', '2024-02-22', '14:30:00', 'Arun Jaitley Stadium', 180.00, 280, 350),
('Mumbai Titans', 'Hyderabad Hawks', '2024-02-25', '15:00:00', 'Wankhede Stadium', 200.00, 320, 400),
('Bangalore Bulls', 'Hyderabad Hawks', '2024-02-28', '11:00:00', 'M. Chinnaswamy Stadium', 130.00, 150, 180);