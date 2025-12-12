import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Wand2, Loader2, ArrowRight } from 'lucide-react';
import { analyzeImageAndGetTemplates, generateBackgroundImage } from './services/geminiService';
import { AppStep, AnalysisResult, ThumbnailTemplate } from './types';
import { TemplateCard } from './components/TemplateCard';
import { ThumbnailEditor } from './components/ThumbnailEditor';

const DEMO_MODE = false; // Set to true to skip API calls for UI testing if needed

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [topic, setTopic] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate | null>(null);
  const [generatedBg, setGeneratedBg] = useState<string | null>(null);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!selectedImage || !topic) return;
    
    setIsAnalyzing(true);
    setStep(AppStep.ANALYZING);

    try {
      const result = await analyzeImageAndGetTemplates(selectedImage.split(',')[1], topic);
      setAnalysisResult(result);
      setStep(AppStep.TEMPLATE_SELECTION);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please try again.");
      setStep(AppStep.UPLOAD);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTemplateSelect = async (template: ThumbnailTemplate) => {
    setSelectedTemplate(template);
    setStep(AppStep.EDITOR);
    setIsGeneratingBg(true);
    
    // Trigger background generation in background
    try {
       const bgImage = await generateBackgroundImage(template.suggestedBackground);
       setGeneratedBg(bgImage);
    } catch (e) {
       console.error(e);
    } finally {
      setIsGeneratingBg(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      
      {/* Header */}
      {step !== AppStep.EDITOR && (
        <header className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur-md z-50">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <Wand2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Thumb<span className="text-cyan-400">Architect</span> AI
            </h1>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
             v1.0 • Gemini Powered
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        
        {/* Step 1: Upload */}
        {step === AppStep.UPLOAD && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6">
                Design High-CTR Thumbnails <br/>in Seconds
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Upload your photo and topic. Our AI Creative Director will structure 
                the perfect layout, remove the background, and apply marketing psychology.
              </p>
            </div>

            <div className="w-full max-w-md space-y-6 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-sm">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Video Topic / Title</label>
                <input
                  type="text"
                  placeholder="e.g. How I learned to code in 30 days"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Your Photo (Face/Subject)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                    ${selectedImage ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
                  `}>
                    {selectedImage ? (
                      <div className="relative h-48 w-full">
                         <img src={selectedImage} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                           <span className="text-white text-sm font-medium">Click to change</span>
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-6">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:scale-110 transition-all">
                          <Upload size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-300">Click or drag image</p>
                          <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={startAnalysis}
                disabled={!topic || !selectedImage}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Generate Blueprints <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Analyzing */}
        {step === AppStep.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-[80vh] space-y-8 animate-in fade-in duration-500">
             <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 rounded-full"></div>
                <Loader2 className="w-16 h-16 text-cyan-400 animate-spin relative z-10" />
             </div>
             <div className="text-center space-y-2">
               <h3 className="text-2xl font-bold text-white">Analyzing Composition...</h3>
               <p className="text-slate-400">The AI Creative Director is reviewing your lighting and topic.</p>
               <div className="flex gap-2 justify-center mt-4">
                 <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-150"></span>
                 <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-300"></span>
               </div>
             </div>
          </div>
        )}

        {/* Step 3: Template Selection */}
        {step === AppStep.TEMPLATE_SELECTION && analysisResult && (
          <div className="px-6 py-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Select Your Blueprint</h2>
              <div className="bg-slate-900/50 border-l-4 border-cyan-500 p-4 rounded-r-lg max-w-3xl">
                <p className="text-slate-300 italic">" {analysisResult.critique} "</p>
                <p className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-widest">— AI Creative Director</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisResult.templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={false}
                  onSelect={() => handleTemplateSelect(template)}
                />
              ))}
            </div>

            <div className="mt-12 border-t border-slate-800 pt-8">
               <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Background Concepts Identified</h4>
               <div className="flex flex-wrap gap-3">
                 {analysisResult.backgroundSuggestions.map((bg, i) => (
                   <div key={i} className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 text-sm text-slate-400">
                     {bg}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* Step 4: Editor */}
        {step === AppStep.EDITOR && selectedTemplate && (
          <div className="fixed inset-0 bg-slate-950 z-50 animate-in fade-in duration-300">
            <ThumbnailEditor
              template={selectedTemplate}
              userImageUrl={selectedImage}
              bgImageUrl={generatedBg}
              onBack={() => setStep(AppStep.TEMPLATE_SELECTION)}
              isGeneratingBg={isGeneratingBg}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;