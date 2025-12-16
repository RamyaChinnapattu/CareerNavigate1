// app/routes/api.jobs.ts
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

interface Job {
  title: string;
  company_name: string;
  location: string;
  link: string;
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { title, mode } = await request.json(); 

    if (!title) {
      return json({ error: "Missing title" }, { status: 400 });
    }

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return json({ error: "API key is not configured" }, { status: 500 });
    }

    // --- FIX: ULTRA-BROAD QUERY ---
    let searchQuery = title;

    if (mode === 'intern') {
        // REMOVED: -\"training fee\" -\"unpaid\" (Too strict, caused 0 results)
        // Just search for the role + internship to guarantee results
        searchQuery += " internship"; 
    }

    const url = new URL("https://serpapi.com/search");
    url.searchParams.append("engine", "google_jobs");
    url.searchParams.append("q", searchQuery);
    
    // Broad Location "India" catches Remote, Hybrid, and On-site
    url.searchParams.append("location", "India"); 
    
    url.searchParams.append("google_domain", "google.co.in");
    url.searchParams.append("hl", "en");
    url.searchParams.append("gl", "in");
    url.searchParams.append("api_key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error || !data.jobs_results) {
      return json({ jobs: [] });
    }

    const transformedJobs: Job[] = data.jobs_results
      .slice(0, 10)
      .map((job: any) => ({
        title: job.title,
        company_name: job.company_name,
        location: job.location,
        link: job.apply_link || job.related_links?.[0]?.link || job.share_link,
      }));

    return json({ jobs: transformedJobs });

  } catch (error: any) {
    console.error("Job API error:", error);
    return json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export function loader() {
  return json({ error: "Method not allowed" }, { status: 405 });
}