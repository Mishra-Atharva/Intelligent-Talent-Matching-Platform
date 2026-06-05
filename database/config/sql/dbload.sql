INSERT INTO users (email, password, type, premium, reset_token, created_at) VALUES
('alice.candidate@example.com', 'password123', 'Candidate', FALSE, NULL, NOW()),
('bob.candidate@example.com', 'password123', 'Candidate', FALSE, NULL, NOW()),
('carol.candidate@example.com', 'password123', 'Candidate', FALSE, NULL, NOW()),
('delta.employer@example.com', 'password123', 'Employer', FALSE, NULL, NOW()),
('echo.employer@example.com', 'password123', 'Employer', FALSE, NULL, NOW());

INSERT INTO candidate_profiles (user_id, first_name, last_name, age, phone, location, education_level, major, university, graduation_year, years_of_experience, preferred_work_mode, preferred_location, summary, updated_at) VALUES
(1, 'Alice', 'Anderson', 26, '+1111111111', 'Austin, TX', 'Bachelor', 'Computer Science', 'UT Austin', '2022', '2', 'Remote', 'Remote', 'Entry level software developer', NOW()),
(2, 'Bob', 'Brown', 30, '+1222222222', 'Seattle, WA', 'Master', 'Data Science', 'UW', '2018', '6', 'Hybrid', 'Seattle', 'Data scientist with ML experience', NOW()),
(3, 'Carol', 'Clark', 28, '+1333333333', 'San Francisco, CA', 'Bachelor', 'Information Systems', 'SFSU', '2020', '4', 'On-site', 'San Francisco', 'Front-end developer', NOW());

INSERT INTO candidate_work_experience (user_id, company, role, start_date, end_date) VALUES
(2, 'DataCorp', 'Data Scientist', '2019-07-01', '2022-12-31'),
(3, 'WebWorks', 'Frontend Developer', '2020-06-01', NULL);

INSERT INTO candidate_skills (user_id, skill) VALUES
(1, 'Python'),
(1, 'FastAPI'),
(2, 'Python'),
(2, 'Machine Learning'),
(3, 'JavaScript'),
(3, 'React');

INSERT INTO employer_profiles (user_id, company_name, industry, company_size, location, website, established, description, updated_at) VALUES
(4, 'Delta Tech', 'Technology', '200-500', 'Austin, TX', 'https://deltatech.example.com', '2010', 'Mid-size tech company', NOW()),
(5, 'Echo Solutions', 'Consulting', '50-100', 'Seattle, WA', 'https://echo.example.com', '2015', 'Consulting firm', NOW());

INSERT INTO job_postings (employer_id, title, description, location, work_mode, employment_type, experience_required, education_required, salary, start_date, end_date, status, applicants, created_at, updated_at) VALUES
(4, 'Backend Engineer', 'Work on APIs and services', 'Austin, TX', 'Remote', 'Full-time', '3+ years', 'Bachelor', '$90k-$110k', '2026-07-01', '2026-12-31', 'Active', 0, NOW(), NOW()),
(5, 'Data Engineer', 'Build data pipelines', 'Seattle, WA', 'Hybrid', 'Full-time', '2+ years', 'Bachelor', '$100k-$130k', '2026-08-01', '2027-01-31', 'Active', 0, NOW(), NOW());

INSERT INTO job_posting_skills (job_id, skill) VALUES
(1, 'Python'),
(1, 'PostgreSQL'),
(2, 'Python'),
(2, 'ETL');

INSERT INTO job_applications (job_id, candidate_id, status, applied_at) VALUES
(1, 1, 'Pending', NOW()),
(2, 2, 'Pending', NOW());

INSERT INTO saved_jobs (candidate_id, job_id, saved_at) VALUES
(1, 2, NOW()),
(3, 1, NOW());

INSERT INTO employer_invites (employer_id, candidate_id, job_id, message, status, sent_at) VALUES
(4, 1, 1, 'We liked your profile', 'Sent', NOW()),
(5, 3, 2, 'Please consider this role', 'Sent', NOW());

INSERT INTO alerts (user_id, message, status, created_at) VALUES
(1, 'New job matching your profile', 'Unread', NOW()),
(2, 'Your application was reviewed', 'Unread', NOW()),
(4, 'New candidate applied', 'Unread', NOW());
