// app/components/SkillGap.tsx

/**
 * Renders a list of skills.
 * If 'showLearningLinks' is true, it will render each skill as a card
 * with direct search links to learning platforms.
 */
const SkillList = ({
  title,
  skills,
  color,
  showLearningLinks = false,
}: {
  title: string;
  skills: string[];
  color: string;
  showLearningLinks?: boolean;
}) => {
  // Helper function to create search URLs
  const createSearchUrl = (
    platform: "coursera" | "youtube" | "docs",
    skill: string
  ) => {
    const query = encodeURIComponent(skill);
    switch (platform) {
      case "coursera":
        return `https://www.coursera.org/search?query=${query}`;
      case "youtube":
        return `https://www.youtube.com/results?search_query=${query}+tutorial`;
      case "docs":
        return `https://www.google.com/search?q=${query}+documentation`;
    }
  };

  return (
    <div>
      <h4 className="font-semibold text-lg mb-3">{title}</h4>
      <div className="flex flex-wrap gap-3">
        {" "}
        {/* Use gap-3 for better spacing */}
        {skills && skills.length > 0 ? (
          skills.map((skill, index) => {
            if (showLearningLinks) {
              // --- NEW: Render as an "actionable card" ---
              return (
                <div
                  key={index}
                  className={`bg-${color}-50 border border-${color}-200 rounded-lg p-3 w-full sm:w-auto flex-grow`}
                >
                  <span className={`text-${color}-900 text-sm font-semibold`}>
                    {skill}
                  </span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 items-center mt-2">
                    <span className="text-xs font-normal text-gray-700">
                      Learn:
                    </span>
                    <a
                      href={createSearchUrl("coursera", skill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:underline text-xs"
                      title={`Search for ${skill} on Coursera`}
                    >
                      Coursera
                    </a>
                    <a
                      href={createSearchUrl("youtube", skill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-red-600 hover:underline text-xs"
                      title={`Search for ${skill} on YouTube`}
                    >
                      YouTube
                    </a>
                    <a
                      href={createSearchUrl("docs", skill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-700 hover:underline text-xs"
                      title={`Search for ${skill} documentation`}
                    >
                      Docs
                    </a>
                  </div>
                </div>
              );
            }

            // --- Original: Render as a simple badge ---
            return (
              <span
                key={index}
                className={`bg-${color}-100 text-${color}-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded`}
              >
                {skill}
              </span>
            );
          })
        ) : (
          <p className="text-sm text-gray-500">
            {showLearningLinks
              ? "No missing skills identified. Great job!"
              : "No skills data available."}
          </p>
        )}
      </div>
    </div>
  );
};

export function SkillGap({ feedback }: { feedback: any }) {
  const skillAnalysis = feedback?.skill_gap;
  const hasMissingSkills =
    skillAnalysis?.missing_skills && skillAnalysis.missing_skills.length > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-2xl font-bold">Skill Gap Analysis</h3>
        {hasMissingSkills && (
          <p className="text-sm text-gray-600 mt-1">
            Here are the skills you're missing, with direct links to find
            resources.
          </p>
        )}
      </div>
      <div className="space-y-6">
        <SkillList
          title="✅ Skills Found on Your Resume"
          skills={skillAnalysis?.found_skills}
          color="green"
        />
        <SkillList
          title="❌ Skills Missing for the Job"
          skills={skillAnalysis?.missing_skills}
          color="red"
          showLearningLinks={true} // <-- This prop activates the learning links
        />
      </div>
    </div>
  );
}