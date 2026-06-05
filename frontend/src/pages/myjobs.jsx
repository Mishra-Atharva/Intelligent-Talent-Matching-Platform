// In development, use relative path so Vite's dev-server proxy forwards `/api` calls
// to the backend and avoids CORS issues. In production, use the environment variable
// or fall back to the origin (e.g. https://api.example.com/api).
const BASE_URL = import.meta.env?.DEV 
    ? '/api'  // Use Vite proxy in development
    : (import.meta.env?.VITE_API_URL || (typeof window !== "undefined" ? (window.__BACKEND_URL__ || (window.location.origin + "/api")) : "http://localhost:8000/api"));

async function request(path, method = "GET", body = null, token = null)
{
    try
    {
        // Ensure path starts with '/'
        if (!path.startsWith("/")) path = "/" + path;

        const headers = {};

        const options = { method, headers };

        // Attach authorization header when token provided
        if (token)
        {
            headers["Authorization"] = "Bearer " + token;
        }

        // Handle FormData (multipart) vs JSON bodies
        if (body instanceof FormData)
        {
            // Let fetch set the Content-Type including the boundary
            options.body = body;
        }
        else if (body !== null && body !== undefined)
        {
            headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }

        const url = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) + path : BASE_URL + path;

        const response = await fetch(url, options);

        // No content
        if (response.status === 204)
        {
            return {};
        }

        // Try parse JSON, but tolerate non-JSON responses
        let data = null;
        try
        {
            data = await response.json();
        }
        catch (parseErr)
        {
            if (response.ok)
            {
                return {};
            }
            console.error("API returned non-JSON response", parseErr);
            return null;
        }

        if (response.ok)
        {
            return data;
        }
        else
        {
            console.error("API error " + response.status + ":", data?.detail || data);
            return null;
        }
    }
    catch (err)
    {
        console.error("Network error:", err);
        return null;
    }
}

export async function apiRegister(email, password, firstName, lastName)
{
    return request("/user/register", "POST", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
    });
}

export async function apiLogin(email, password)
{
    return request("/user/authenticate", "POST", { email, password });
}

export async function apiCreateCandidateProfile(token, data)
{
    return request("/candidate/profile/create", "POST", data, token);
}

export async function apiGetCandidateProfile(token, profileId)
{
    return request("/candidate/profile/" + profileId, "GET", null, token);
}

// Look up a candidate profile by user_id (requires GET /api/candidate/profile/user/{user_id})
export async function apiGetCandidateProfileByUser(token, userId)
{
    return request("/candidate/profile/user/" + userId, "GET", null, token);
}

export async function apiUpdateCandidateProfile(token, profileId, data)
{
    return request("/candidate/profile/" + profileId, "PUT", data, token);
}

export async function apiAddExperience(token, userId, company, role, startDate, endDate)
{
    return request("/candidate/experience/create", "POST", {
        user_id: userId,
        company,
        role,
        start_date: startDate,
        end_date: endDate || null,
    }, token);
}

export async function apiDeleteExperience(token, experienceId)
{
    return request("/candidate/experience/" + experienceId, "DELETE", null, token);
}

export async function apiGetUserSkills(token, userId)
{
    return request("/candidate/skills/user/" + userId, "GET", null, token);
}

export async function apiAddSkill(token, userId, skill)
{
    return request("/candidate/skills/add", "POST", { user_id: userId, skill }, token);
}

export async function apiDeleteSkill(token, skillId)
{
    return request("/candidate/skills/" + skillId, "DELETE", null, token);
}

export async function apiCreateEmployerProfile(token, data)
{
    return request("/employer/profile/create", "POST", data, token);
}

export async function apiGetEmployerProfile(token, profileId)
{
    return request("/employer/profile/" + profileId, "GET", null, token);
}

// Look up an employer profile by user_id (requires GET /api/employer/profile/user/{user_id})
export async function apiGetEmployerProfileByUser(token, userId)
{
    return request("/employer/profile/user/" + userId, "GET", null, token);
}

export async function apiUpdateEmployerProfile(token, profileId, data)
{
    return request("/employer/profile/" + profileId, "PUT", data, token);
}

// Requires GET /api/candidate/profiles on the backend
export async function apiGetAllCandidates(token)
{
    return request("/candidate/profiles", "GET", null, token);
}

export async function apiGetCandidate(token, candidateId)
{
    return request("/candidates/" + candidateId, "GET", null, token);
}

// Requires GET /api/jobs on the backend (all jobs, for candidates browsing)
export async function apiGetAllJobs(token)
{
    return request("/jobs", "GET", null, token);
}

// Fetch only this employer's job postings (requires GET /api/jobs/employer/{employer_id})
export async function apiGetEmployerJobs(token, employerId)
{
    return request("/jobs/employer/" + employerId, "GET", null, token);
}

export async function apiGetJob(token, jobId)
{
    return request("/jobs/" + jobId, "GET", null, token);
}

export async function apiCreateJob(token, data)
{
    return request("/jobs/create", "POST", data, token);
}

export async function apiUpdateJob(token, jobId, data)
{
    return request("/jobs/" + jobId, "PUT", data, token);
}

export async function apiDeleteJob(token, jobId)
{
    return request("/jobs/" + jobId, "DELETE", null, token);
}

export async function apiGetJobSkills(token, jobId)
{
    return request("/jobs/skills/job/" + jobId, "GET", null, token);
}

export async function apiAddJobSkill(token, jobId, skill)
{
    return request("/jobs/skills/add", "POST", { job_id: jobId, skill }, token);
}

export async function apiDeleteJobSkill(token, skillId)
{
    return request("/jobs/skills/" + skillId, "DELETE", null, token);
}

export async function apiApplyToJob(token, jobId, candidateId)
{
    return request("/applications/create", "POST", {
        job_id: jobId,
        candidate_id: candidateId,
        status: "Pending",
    }, token);
}

export async function apiGetSavedJobs(token, candidateId)
{
    return request("/saved-jobs/candidate/" + candidateId, "GET", null, token);
}

export async function apiSaveJob(token, candidateId, jobId)
{
    return request("/saved-jobs/save", "POST", { candidate_id: candidateId, job_id: jobId }, token);
}

export async function apiUnsaveJob(token, savedId)
{
    return request("/saved-jobs/" + savedId, "DELETE", null, token);
}

export async function apiSendInvite(token, employerId, candidateId, jobId)
{
    return request("/invites/create", "POST", {
        employer_id: employerId,
        candidate_id: candidateId,
        job_id: jobId,
        status: "Sent",
    }, token);
}

export async function apiGetAlerts(token, userId)
{
    return request("/alert/user/" + userId, "GET", null, token);
}

export async function apiMarkAlertRead(token, alertId)
{
    return request("/alert/" + alertId, "PUT", { status: "Read" }, token);
}