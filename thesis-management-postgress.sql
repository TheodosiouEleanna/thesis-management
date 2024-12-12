-- Define ENUM type for user roles
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'secretariat');

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role user_role NOT NULL, -- Custom ENUM type for roles
    password_hash TEXT NOT NULL,
    contact_details JSONB, -- Stores address, phone, and email details for students
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create theses table
CREATE TABLE theses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    detailed_file TEXT, -- Path or link to a detailed file
    student_id INT REFERENCES users(id) ON DELETE SET NULL, -- Links to students
    supervisor_id INT REFERENCES users(id) ON DELETE SET NULL, -- Links to instructors
    status VARCHAR(50) NOT NULL CHECK (status IN ('under_assignment', 'active', 'under_examination', 'completed')), -- Allowed statuses
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create committees table
CREATE TABLE committees (
    id SERIAL PRIMARY KEY,
    thesis_id INT REFERENCES theses(id) ON DELETE CASCADE, -- Links to theses
    member_id INT REFERENCES users(id) ON DELETE CASCADE, -- Committee members
    role VARCHAR(50) NOT NULL CHECK (role IN ('supervisor', 'member')) -- Role in the committee
);

-- Create progress table
CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    thesis_id INT REFERENCES theses(id) ON DELETE CASCADE, -- Links to theses
    instructor_id INT REFERENCES users(id) ON DELETE CASCADE, -- Note creator
    note TEXT NOT NULL CHECK (LENGTH(note) <= 300), -- Limit note length
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create grades table
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    thesis_id INT REFERENCES theses(id) ON DELETE CASCADE, -- Links to theses
    member_id INT REFERENCES users(id) ON DELETE CASCADE, -- Grading instructor
    grade DECIMAL(4, 2) NOT NULL CHECK (grade BETWEEN 0 AND 100), -- Grade range validation
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create announcements table
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    presentation_date TIMESTAMP NOT NULL, -- Date and time of presentation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create thesis_material table
CREATE TABLE thesis_material (
    id SERIAL PRIMARY KEY,
    thesis_id INT REFERENCES theses(id) ON DELETE CASCADE, -- Links to theses
    file_url TEXT NOT NULL, -- Path or link to uploaded file
    material_type VARCHAR(50) NOT NULL CHECK (material_type IN ('draft', 'supporting_material')), -- Type of material
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create thesis_material table
CREATE TABLE thesis_material (
    id SERIAL PRIMARY KEY,
    thesis_id INT REFERENCES theses(id) ON DELETE CASCADE, -- Links to theses
    file_url TEXT NOT NULL, -- Path or link to uploaded file
    material_type VARCHAR(50) NOT NULL CHECK (material_type IN ('draft', 'supporting_material')), -- Type of material
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link student_id in theses to id in users
ALTER TABLE theses
ADD CONSTRAINT fk_theses_student
FOREIGN KEY (student_id)
REFERENCES users (id)
ON DELETE SET NULL;

-- Link supervisor_id in theses to id in users
ALTER TABLE theses
ADD CONSTRAINT fk_theses_supervisor
FOREIGN KEY (supervisor_id)
REFERENCES users (id)
ON DELETE SET NULL;


-- Link thesis_id in committees to id in theses
ALTER TABLE committees
ADD CONSTRAINT fk_committees_thesis
FOREIGN KEY (thesis_id)
REFERENCES theses (id)
ON DELETE CASCADE;

-- Link member_id in committees to id in users
ALTER TABLE committees
ADD CONSTRAINT fk_committees_member
FOREIGN KEY (member_id)
REFERENCES users (id)
ON DELETE CASCADE;

-- Link thesis_id in progress to id in theses
ALTER TABLE progress
ADD CONSTRAINT fk_progress_thesis
FOREIGN KEY (thesis_id)
REFERENCES theses (id)
ON DELETE CASCADE;

-- Link instructor_id in progress to id in users
ALTER TABLE progress
ADD CONSTRAINT fk_progress_instructor
FOREIGN KEY (instructor_id)
REFERENCES users (id)
ON DELETE CASCADE;


-- Link thesis_id in grades to id in theses
ALTER TABLE grades
ADD CONSTRAINT fk_grades_thesis
FOREIGN KEY (thesis_id)
REFERENCES theses (id)
ON DELETE CASCADE;

-- Link member_id in grades to id in users
ALTER TABLE grades
ADD CONSTRAINT fk_grades_member
FOREIGN KEY (member_id)
REFERENCES users (id)
ON DELETE CASCADE;

-- Link thesis_id in thesis_material to id in theses
ALTER TABLE thesis_material
ADD CONSTRAINT fk_thesis_material_thesis
FOREIGN KEY (thesis_id)
REFERENCES theses (id)
ON DELETE CASCADE;

ALTER TABLE committees
ADD COLUMN invite_status VARCHAR(50) CHECK (invite_status IN ('invited', 'accepted', 'rejected')) DEFAULT 'invited';

ALTER TABLE committees
ADD COLUMN invite_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE committees
ADD COLUMN response_date TIMESTAMP;

INSERT INTO theses (title, description, status)
VALUES ('AI-Powered Personalized Learning Systems',
        'This thesis explores the development of an AI-powered learning system that personalizes educational content based on a student''s unique learning style, pace, and performance.',
        'under_assignment');

       INSERT INTO theses (title, description, status)
VALUES ('Blockchain for Secure Online Voting Systems',
        'This thesis focuses on the design and development of a secure online voting system using blockchain technology to ensure transparency, security, and immutability of votes while maintaining voter anonymity.',
        'under_assignment');


       INSERT INTO theses (title, description, status)
VALUES ('Predictive Maintenance System for Smart Factories',
        'This thesis aims to create a predictive maintenance system that leverages IoT devices and machine learning models to predict equipment failures in a smart factory environment, reducing downtime and optimizing operational efficiency.',
        'under_assignment');


       INSERT INTO theses (title, description, status)
VALUES ('Natural Language Processing (NLP) for Sentiment Analysis in Customer Reviews',
        'This thesis investigates the application of NLP techniques for sentiment analysis in customer reviews, aiming to develop an automated system that classifies feedback as positive, negative, or neutral.',
        'under_assignment');


        INSERT INTO "thesis-management".users
( "name", email, "role", password_hash, contact_details, created_at)
VALUES
( 'Alice Smith', 'alice.smith@student.com', 'student'::"thesis-management"."user_role",
'$2b$10$D8p72hYh/E7RXvBqUBQnReM1zt5OZ5lY7k9MNO8JsyAlOumf2QCvK',
'{"phone": "1122334455", "mobile": "987654321", "address": "456 Elm Street, 54321"}'::jsonb,
'2024-11-28 16:20:54.327');

INSERT INTO "thesis-management".users
( "name", email, "role", password_hash, contact_details, created_at)
VALUES
( 'Bob Johnson', 'bob.johnson@student.com', 'student'::"thesis-management"."user_role",
'$2b$10$HjE4xr8/hNsVC.WMk48UFeOES1G2z8pFq5.kX3nV2m30OvHK3BYCm',
'{"phone": "2233445566", "mobile": "567891234", "address": "789 Maple Avenue, 67890"}'::jsonb,
'2024-11-28 16:25:54.327');


INSERT INTO "thesis-management".users
( "name", email, "role", password_hash, contact_details, created_at)
VALUES
('Claire White', 'claire.white@student.com', 'student'::"thesis-management"."user_role",
'$2b$10$9gkd1TYMT9bF5xx3P.k3/Uy8Pqyx1wQn0rOkOhnC2DLiyF1lID7Gy',
'{"phone": "5566778899", "mobile": "678901234", "address": "987 Birch Lane, 11223"}'::jsonb,
'2024-11-28 16:30:54.327');


INSERT INTO "thesis-management".users
( "name", email, "role", password_hash, contact_details, created_at)
VALUES
('David Brown', 'david.brown@student.com', 'student'::"thesis-management"."user_role",
'$2b$10$1HLjEJXp1JbpY1i/z/k1rEf.6o6H7PzwpIGfJmDgVh.jlDMLq8XIG',
'{"phone": "6655443322", "mobile": "765432109", "address": "321 Oak Drive, 33221"}'::jsonb,
'2024-11-28 16:40:54.327');



