CREATE TABLE IF NOT EXISTS users (
    user_id     SERIAL PRIMARY KEY,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    type        VARCHAR(10)     NOT NULL CHECK (type IN ('Candidate', 'Employer')),
    first_name  VARCHAR(255),
    last_name   VARCHAR(255),
    premium     BOOLEAN         NOT NULL DEFAULT FALSE,
    reset_token TEXT,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_profiles (
    profile_id          SERIAL PRIMARY KEY,
    user_id             INTEGER         NOT NULL UNIQUE,
    first_name          VARCHAR(255)    NOT NULL,
    last_name           VARCHAR(255),
    age                 INTEGER,
    phone               VARCHAR(20),
    location            VARCHAR(255),
    education_level     VARCHAR(50),
    major               VARCHAR(255),
    university          VARCHAR(255),
    graduation_year     VARCHAR(4),
    years_of_experience VARCHAR(20),
    preferred_work_mode VARCHAR(10)     CHECK (preferred_work_mode IN ('Remote', 'Hybrid', 'On-site')),
    preferred_location  VARCHAR(255),
    summary             TEXT,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidate_work_experience (
    experience_id   SERIAL PRIMARY KEY,
    user_id         INTEGER         NOT NULL,
    company         VARCHAR(255)    NOT NULL,
    role            VARCHAR(255)    NOT NULL,
    start_date      DATE            NOT NULL,
    end_date        DATE,           

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidate_skills (
    skill_id    SERIAL PRIMARY KEY,
    user_id     INTEGER         NOT NULL,
    skill       VARCHAR(100)    NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employer_profiles (
    profile_id      SERIAL PRIMARY KEY,
    user_id         INTEGER         NOT NULL UNIQUE,
    company_name    VARCHAR(255)    NOT NULL,
    industry        VARCHAR(255),
    company_size    VARCHAR(20),
    location        VARCHAR(255),
    website         VARCHAR(255),
    established     VARCHAR(4),
    description     TEXT,
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_postings (
    job_id              SERIAL PRIMARY KEY,
    employer_id         INTEGER         NOT NULL,
    title               VARCHAR(255)    NOT NULL,
    description         TEXT            NOT NULL,
    location            VARCHAR(255)    NOT NULL,
    work_mode           VARCHAR(10)     NOT NULL CHECK (work_mode IN ('Remote', 'Hybrid', 'On-site')),
    employment_type     VARCHAR(20)     NOT NULL CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Casual', 'Internship')),
    experience_required VARCHAR(50),
    education_required  VARCHAR(50),    
    salary              VARCHAR(100),
    start_date          DATE            NOT NULL,
    end_date            DATE            NOT NULL,
    status              VARCHAR(10)     NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Closed')),
    applicants          INTEGER         NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    FOREIGN KEY (employer_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS job_posting_skills (
    skill_id    SERIAL PRIMARY KEY,
    job_id      INTEGER         NOT NULL,
    skill       VARCHAR(100)    NOT NULL,

    FOREIGN KEY (job_id) REFERENCES job_postings(job_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_applications (
    application_id  SERIAL PRIMARY KEY,
    job_id          INTEGER         NOT NULL,
    candidate_id    INTEGER         NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewed', 'Accepted', 'Rejected')),
    applied_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    UNIQUE (job_id, candidate_id),

    FOREIGN KEY (job_id)        REFERENCES job_postings(job_id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id)  REFERENCES users(user_id)       ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_jobs (
    saved_id        SERIAL PRIMARY KEY,
    candidate_id    INTEGER         NOT NULL,
    job_id          INTEGER         NOT NULL,
    saved_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (candidate_id, job_id),

    FOREIGN KEY (candidate_id)  REFERENCES users(user_id)       ON DELETE CASCADE,
    FOREIGN KEY (job_id)        REFERENCES job_postings(job_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS employer_invites (
    invite_id       SERIAL PRIMARY KEY,
    employer_id     INTEGER         NOT NULL,
    candidate_id    INTEGER         NOT NULL,
    job_id          INTEGER,        
    message         TEXT,
    status          VARCHAR(20)     NOT NULL DEFAULT 'Sent' CHECK (status IN ('Sent', 'Accepted', 'Declined')),
    sent_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    FOREIGN KEY (employer_id)   REFERENCES users(user_id)       ON DELETE CASCADE,
    FOREIGN KEY (candidate_id)  REFERENCES users(user_id)       ON DELETE CASCADE,
    FOREIGN KEY (job_id)        REFERENCES job_postings(job_id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS alerts (
    alert_id    SERIAL PRIMARY KEY,
    user_id     INTEGER         NOT NULL,
    message     TEXT            NOT NULL,
    status      VARCHAR(6)      NOT NULL DEFAULT 'Unread' CHECK (status IN ('Unread', 'Read')),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);