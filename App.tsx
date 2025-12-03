import React, { useState, useRef } from 'react';
import { extractImageLabels, generateMemeContent } from './services/geminiService';
import { MemeCanvas } from './components/MemeCanvas';
import { Vibe, MemeResponse, MemeLength, ColorMode } from './types';

export default function App() {
  // State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [labels, setLabels] = useState<string>("no_clear_labels");
  const [textContext, setTextContext] = useState<string>("");
  const [vibe, setVibe] = useState<Vibe>(Vibe.Funny);
  const [memeLength, setMemeLength] = useState<MemeLength>(MemeLength.Medium);
  const [directGenerate, setDirectGenerate] = useState<boolean>(true);
  
  // Color & Style State
  const [colorMode, setColorMode] = useState<ColorMode>(ColorMode.Auto);
  const [primaryColor, setPrimaryColor] = useState<string>("#FFD700"); // Gold
  const [secondaryColor, setSecondaryColor] = useState<string>("#8A2BE2"); // Purple
  const [shadeIntensity, setShadeIntensity] = useState<number>(0.6);
  const [gradientAngle, setGradientAngle] = useState<number>(45);
  const [randomizeColors, setRandomizeColors] = useState<boolean>(false);
  const [regenerateCount, setRegenerateCount] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [memeData, setMemeData] = useState<MemeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset state for new image
      setLabels("no_clear_labels");
      setMemeData(null);
      setError(null);
      setRegenerateCount(0);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async (isRegeneration = false) => {
    if (!imageFile && !textContext) {
      setError("Please upload an image or provide text context.");
      return;
    }

    setLoading(true);
    setError(null);

    // If it's a new generation (not just regen), or a specific regen call, increment count
    const nextCount = isRegeneration ? regenerateCount + 1 : 0;
    if (!isRegeneration) setRegenerateCount(0);
    else setRegenerateCount(nextCount);

    try {
      let currentLabels = "no_clear_labels";
      let imagePresent = false;

      // 1. Vision Analysis (if image exists)
      if (imageFile) {
        imagePresent = true;
        const base64Data = await convertToBase64(imageFile);
        
        // Use existing labels if available for the same image session
        if (labels === "no_clear_labels") {
             currentLabels = await extractImageLabels(base64Data, imageFile.type);
             setLabels(currentLabels);
        } else {
             currentLabels = labels;
        }
      }

      // 2. Generate Meme
      const result = await generateMemeContent({
        labels: currentLabels,
        textContext,
        directGenerate,
        vibe,
        imagePresent,
        memeLength,
        colorSettings: {
          mode: colorMode,
          primary: primaryColor,
          secondary: secondaryColor,
          intensity: shadeIntensity,
          angle: gradientAngle,
          randomize: randomizeColors,
          regenerateCount: nextCount
        }
      });

      setMemeData(result);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    alert("This feature will mint your meme as an NFT on Base soon!");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 safe-area-top pb-10">
      <div className="p-4 md:p-8">
        {/* Header */}
        <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/20 bg-gradient-to-br from-indigo-600 to-cyan-600">
               <div className="text-white font-bold text-xl font-mono">K</div>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              KRYO
            </h1>
          </div>
          <div className="text-xs md:text-sm text-gray-500 font-mono hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </header>

        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            
            {/* Upload Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl shadow-xl">
              <h2 className="text-lg font-semibold mb-4 text-indigo-300 flex items-center gap-2">
                <span className="bg-indigo-900/50 text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Source Material
              </h2>
              
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-600 hover:border-indigo-500 hover:bg-gray-700/50 transition-all flex items-center justify-center gap-2 text-gray-400 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {imageFile ? "Change Photo" : "Upload Photo / Selfie"}
              </button>
              
              {imageFile && (
                 <div className="mt-2 text-xs text-center text-green-400 truncate">
                   Image loaded: {imageFile.name}
                 </div>
              )}
              
              {/* Context Input */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">Context (Optional)</label>
                <input
                  type="text"
                  value={textContext}
                  onChange={(e) => setTextContext(e.target.value)}
                  placeholder="e.g. bought the top"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Config Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl shadow-xl space-y-5">
              <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2">
                <span className="bg-indigo-900/50 text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Vibe & Style
              </h2>

              {/* Vibe Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Vibe</label>
                <div className="grid grid-cols-4 gap-1">
                  {Object.values(Vibe).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVibe(v)}
                      className={`py-1.5 px-1 rounded-md text-[10px] sm:text-xs font-medium capitalize transition-all truncate ${
                        vibe === v 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                          : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meme Length */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Meme Length</label>
                <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
                  {Object.values(MemeLength).map((len) => (
                    <button
                      key={len}
                      onClick={() => setMemeLength(len)}
                      className={`flex-1 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                        memeLength === len 
                          ? 'bg-gray-700 text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-700/50 my-2"></div>

              {/* Color Mode */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-gray-500">Color Mode</label>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] text-gray-500">Randomize?</span>
                     <button 
                        onClick={() => setRandomizeColors(!randomizeColors)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${randomizeColors ? 'bg-indigo-500' : 'bg-gray-600'}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${randomizeColors ? 'left-4.5' : 'left-0.5'}`} style={{ left: randomizeColors ? '18px' : '2px' }}></div>
                      </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ColorMode).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setColorMode(mode)}
                      disabled={randomizeColors}
                      className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                        colorMode === mode 
                          ? 'bg-indigo-900/40 border-indigo-500 text-indigo-300' 
                          : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                      } ${randomizeColors ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Pickers (Conditional) */}
              {!randomizeColors && colorMode !== ColorMode.Auto && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Primary</label>
                    <div className="flex items-center gap-2 bg-gray-900 p-1.5 rounded-lg border border-gray-700">
                      <input 
                        type="color" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" 
                      />
                      <span className="text-xs font-mono text-gray-400">{primaryColor}</span>
                    </div>
                  </div>
                  {colorMode === ColorMode.Dual && (
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Secondary</label>
                      <div className="flex items-center gap-2 bg-gray-900 p-1.5 rounded-lg border border-gray-700">
                        <input 
                          type="color" 
                          value={secondaryColor} 
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" 
                        />
                        <span className="text-xs font-mono text-gray-400">{secondaryColor}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sliders */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Intensity: {shadeIntensity}</label>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.1" 
                    value={shadeIntensity} 
                    onChange={(e) => setShadeIntensity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                {colorMode === ColorMode.Dual && !randomizeColors && (
                   <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Angle: {gradientAngle}°</label>
                      <input 
                        type="range" 
                        min="0" max="360" step="10" 
                        value={gradientAngle} 
                        onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                   </div>
                )}
              </div>

              {/* Direct Generate Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-gray-400">Direct Generate (No Context)</span>
                <button 
                  onClick={() => setDirectGenerate(!directGenerate)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${directGenerate ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                   <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${directGenerate ? 'left-4.5' : 'left-0.5'}`} style={{ left: directGenerate ? '18px' : '2px' }}></div>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pb-8 lg:pb-0">
               <button
                  onClick={() => handleGenerate(false)}
                  disabled={loading || (!imageFile && !textContext)}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all transform active:scale-95 ${
                    loading || (!imageFile && !textContext)
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:shadow-indigo-500/40'
                  }`}
                >
                  {loading ? "Generating..." : "Generate Meme"}
                </button>
                
                {memeData && !loading && (
                   <button
                      onClick={() => handleGenerate(true)}
                      className="w-16 bg-gray-700 hover:bg-gray-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                      title="Regenerate with same settings"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                   </button>
                )}
            </div>
            
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-8 order-1 lg:order-2">
             <div className="sticky top-8">
                <MemeCanvas 
                  imageSrc={previewUrl} 
                  memeData={memeData} 
                  loading={loading} 
                />
                
                {/* Explainer / Result Details */}
                {memeData && !loading && (
                  <div className="mt-6 bg-gray-800/80 backdrop-blur border border-gray-700 p-6 rounded-2xl animate-fade-in mb-8 lg:mb-0">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                      <div className="space-y-2">
                        <div>
                           <h3 className="text-indigo-400 font-bold mb-1 text-xs uppercase tracking-wider">The Logic</h3>
                           <p className="text-gray-300 italic text-sm">"{memeData.explain_hint}"</p>
                        </div>
                        
                        {labels !== "no_clear_labels" && (
                           <div className="text-xs text-gray-500">
                             <span className="font-semibold text-gray-400">Vision:</span> {labels}
                           </div>
                        )}

                        {memeData.overlay_style?.color_hint && (
                           <div className="text-xs text-gray-500">
                              <span className="font-semibold text-gray-400">Palette:</span> {memeData.overlay_style.color_hint}
                           </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={handleDownload}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors whitespace-nowrap shadow-lg shadow-blue-500/30"
                      >
                        Mint on Base (Coming Soon)
                      </button>
                    </div>
                  </div>
                )}
             </div>
          </div>

        </main>
      </div>
    </div>
  );
}