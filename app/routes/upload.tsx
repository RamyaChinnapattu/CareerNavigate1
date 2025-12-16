import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage, extractTextFromPdf} from "~/lib/pdf2img"; // Import the new function
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);
        setStatusText('Starting...');

        try {
            // 1. Upload File
            setStatusText('Uploading the file...');
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) throw new Error('Failed to upload file');

            // 2. Convert to Image
            setStatusText('Converting to image...');
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) throw new Error('Failed to convert PDF to image');

            // 3. Upload Image
            setStatusText('Uploading the image...');
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) throw new Error('Failed to upload image');

            // 4. Extract Text for AI
            setStatusText('Reading resume content...');
            const resumeText = await extractTextFromPdf(file);
            if (!resumeText || resumeText.length < 50) {
                 console.warn("Could not extract text, or text is too short.");
                 // We will continue, but the AI might complain if it's empty.
            }

            setStatusText('Preparing data...');
            const uuid = generateUUID();
            
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, 
                jobTitle, 
                jobDescription,
                feedback: null as any,
            };

            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            // 5. Analyze with AI
            setStatusText('Analyzing...');
            
            // Combine instructions with the ACTUAL resume text
            const instructions = prepareInstructions({ jobTitle, jobDescription });
            const finalPrompt = `${instructions}\n\nHere is the full content of the resume to analyze:\n\n${resumeText}`;

            // Use ai.chat directly with the text prompt
            const feedbackResponse = await ai.chat(
                finalPrompt, 
                undefined, 
                false, 
                { model: 'gpt-4o' }
            );

            if (!feedbackResponse) throw new Error('AI service returned no feedback');

            let feedbackText = typeof feedbackResponse.message.content === 'string'
                ? feedbackResponse.message.content
                : feedbackResponse.message.content[0].text;

            console.log("Raw AI Response:", feedbackText);

            // Clean Markdown
            feedbackText = feedbackText.replace(/```json/g, '').replace(/```/g, '');

            // Extract JSON
            const firstBrace = feedbackText.indexOf('{');
            const lastBrace = feedbackText.lastIndexOf('}');
            
            if (firstBrace !== -1 && lastBrace !== -1) {
                feedbackText = feedbackText.substring(firstBrace, lastBrace + 1);
            } else {
                throw new Error("AI response did not contain valid JSON");
            }

            data.feedback = JSON.parse(feedbackText);

            // Save and Redirect
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            navigate(`/resume/${uuid}`);

        } catch (error: any) {
            console.error("Analysis failed:", error);
            const msg = error instanceof Error ? error.message : "Unknown error";
            setStatusText(`Error: ${msg}`);
            // We keep isProcessing true if you want to freeze it, 
            // OR set it to false to let the user try again:
            setIsProcessing(false); 
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button
                                className="primary-button"
                                type="submit"
                                disabled={!file || isProcessing}
                            >
                                {isProcessing ? 'Analyzing...' : 'Analyze Resume'}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload