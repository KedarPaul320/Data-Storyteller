import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function LandingView() {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { setFileSession } = useFileContext();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection from the hidden native input
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
            setError(null);
        }
    };

    // Execute the API call to Django
    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setIsLoading(true);
        setError(null);

        // Prepare the binary file for HTTP transmission 
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/upload/', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to upload file");
            }

            // Save the backend UUID and Pandas metadata into our session context [2]
            setFileSession(data);

            // Navigate to the analysis dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen px-4 py-10 md:px-8 md:py-12">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
                <header className="fade-up text-center">
                    <img
                        src="/favicon.svg"
                        alt="Data Storyteller logo"
                        className="mx-auto mb-5 h-20 w-20 rounded-2xl bg-white/60 p-2 ring-1 ring-slate-300/60"
                    />
                    <h1 className="brand-title text-5xl md:text-7xl">Data Storyteller</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-base font-semibold text-slate-700/90 md:text-lg">
                        Turn raw rows into stories your team can act on.
                    </p>
                </header>

                <Card className="story-shell fade-up mx-auto w-full max-w-xl [animation-delay:120ms]">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">Start Your Analysis</CardTitle>
                    <CardDescription className="font-medium text-slate-600">Upload a .csv or .xlsx file and instantly explore patterns</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    {/* Custom File Drop/Select Zone */}
                    <div
                        className="upload-drop rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".csv,.xlsx"
                            className="hidden"
                        />
                        {file ? (
                            <p className="rounded-full bg-indigo-950 px-4 py-2 text-sm font-semibold text-amber-100">{file.name}</p>
                        ) : (
                            <p className="text-sm font-semibold text-slate-600">Click to select your dataset</p>
                        )}
                    </div>

                    {error && <p className="text-sm font-semibold text-red-600 text-center">{error}</p>}

                    <Button
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                        className="h-11 w-full bg-gradient-to-r from-indigo-950 via-orange-500 to-red-500 text-white hover:brightness-105"
                    >
                        {isLoading ? "Uploading & Analyzing..." : "Upload & Analyze"}
                    </Button>
                </CardContent>
            </Card>
            </div>
        </div>
    );
}