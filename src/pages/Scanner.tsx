import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, CheckCircle2, AlertTriangle, XCircle, Ruler, Zap, Activity, MapPin, ArrowRight, History } from 'lucide-react';
import { Button, Card, Gauge } from '../components/UI';
import { Button as NeonButton } from '../components/ui/neon-button';
import { StarButton } from '../components/ui/star-button';
import { useTheme } from 'next-themes';
import { useApp } from '../context/AppContext';
import { TyreScan } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface ServiceCenterProps {
  name: string;
  distance: string;
  price?: string;
  url?: string;
}

export function Scanner() {
  const { addTyreScan, state } = useApp();
  const { theme } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [tyreAge, setTyreAge] = useState<number>(state.user.lastTyreChangeYear ? new Date().getFullYear() - state.user.lastTyreChangeYear : 2);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<Omit<TyreScan, 'uid'> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analysisSteps = [
    "Uploading to AI engine...",
    "Detecting tread depth...",
    "Checking for cracks and sidewall damage...",
    "Analyzing wear patterns...",
    "Finalizing assessment..."
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setAnalysisStep(0);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Step through UI feedback
      const stepInterval = setInterval(() => {
        setAnalysisStep(prev => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
      }, 1500);

      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: `Analyze this tyre photo for condition assessment. The tyre is approximately ${tyreAge} years old. Identify tread depth, cracks, wear patterns, and any visible damage. Provide a condition score (0-100), a safety verdict, and specific recommendations. Be very precise and professional in your analysis.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              visualCondition: { type: Type.NUMBER, description: "Condition score from 0 to 100" },
              safetyScore: { type: Type.NUMBER, description: "Safety score from 0 to 100" },
              safeToUse: { type: Type.BOOLEAN },
              verdict: { type: Type.STRING },
              urgency: { type: Type.STRING, enum: ["immediate", "1-2 months", "good condition"] },
              issues: { type: Type.ARRAY, items: { type: Type.STRING } },
              detectedProblems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ["tread_depth", "cracks", "wear_pattern", "damage"] },
                    severity: { type: Type.STRING, enum: ["critical", "warning", "caution", "normal"] },
                    description: { type: Type.STRING },
                    location: { type: Type.STRING },
                    risk: { type: Type.STRING },
                    action: { type: Type.STRING }
                  },
                  required: ["type", "severity", "description"]
                }
              },
              fuelImpactPercentage: { type: Type.NUMBER, description: "Estimated percentage increase in fuel consumption due to tyre condition" },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    priority: { type: Type.STRING, enum: ["critical", "warning", "maintenance", "caution"] },
                    action: { type: Type.STRING },
                    timeline: { type: Type.STRING },
                    safety: { type: Type.STRING },
                    benefit: { type: Type.STRING }
                  },
                  required: ["priority", "action", "timeline"]
                }
              }
            },
            required: ["visualCondition", "safetyScore", "safeToUse", "verdict", "urgency", "detectedProblems", "recommendations", "fuelImpactPercentage"]
          }
        }
      });

      clearInterval(stepInterval);
      
      const analysisResult = JSON.parse(response.text || "{}");
      
      const finalResult: Omit<TyreScan, 'uid'> = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        photoUrl: image,
        monthlyFuelWaste: (analysisResult.fuelImpactPercentage || 0) * 10, // ₹10 per 1% impact (approximate)
        ...analysisResult
      };

      setResult(finalResult);
      addTyreScan(finalResult);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      alert("Failed to analyze tyre. Please ensure you have a valid Gemini API key and a clear photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusBadge = (condition: number) => {
    if (condition >= 70) return { text: 'SAFE TO USE', color: 'bg-[#2C5F2D]', icon: CheckCircle2 };
    if (condition >= 50) return { text: 'REPLACE SOON', color: 'bg-[#F9A825]', icon: AlertTriangle };
    return { text: 'UNSAFE', color: 'bg-[#F96167]', icon: XCircle };
  };

  const [nearbyCenters, setNearbyCenters] = useState<ServiceCenterProps[] | null>(null);
  const [isFindingCenters, setIsFindingCenters] = useState(false);

  const findServiceCenters = async () => {
    setIsFindingCenters(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Get user location if possible
      let locationPrompt = "Find tyre service centers nearby.";
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        locationPrompt = `Find tyre service centers near latitude ${pos.coords.latitude}, longitude ${pos.coords.longitude}.`;
      } catch (e) {
        console.warn("Location access denied, using general search");
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: locationPrompt,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const centers = chunks
          .filter((chunk: any) => chunk.maps?.uri)
          .map((chunk: any) => ({
            name: chunk.maps.title || "Tyre Service Center",
            url: chunk.maps.uri,
            distance: "Nearby", // Grounding doesn't always give distance directly
          }));
        setNearbyCenters(centers);
      } else {
        // Fallback if no grounding chunks
        alert("Could not find specific service centers. Please check Google Maps.");
      }
    } catch (error) {
      console.error("Failed to find service centers:", error);
      alert("Error searching for service centers.");
    } finally {
      setIsFindingCenters(false);
    }
  };

  if (result) {
    const badge = getStatusBadge(result.visualCondition);
    const lightColor = theme === 'dark' ? '#FAFAFA' : '#065A82';
    
    return (
      <div className="space-y-8 pb-12">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-gray-900">Scan Results</h1>
          <NeonButton variant="default" size="sm" onClick={() => { setResult(null); setImage(null); setNearbyCenters(null); }}>
            New Scan
          </NeonButton>
        </header>

        <div className="flex flex-col items-center">
          <div className={`${badge.color} text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-black text-xl shadow-lg mb-8`}>
            <badge.icon size={28} /> {badge.text} - {result.visualCondition}% Condition
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 flex flex-col items-center justify-center py-12">
            <Gauge value={result.visualCondition} label="Condition Score" />
            <div className="mt-8 text-center">
              <h3 className="font-black text-xl text-gray-900 mb-2">OVERALL VERDICT</h3>
              <p className="text-gray-500 font-bold leading-relaxed">{result.verdict}</p>
            </div>
          </Card>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.detectedProblems.map((problem, i) => (
              <Card key={i} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl text-[#065A82]">
                    {problem.type === 'tread_depth' ? <Ruler /> : problem.type === 'cracks' ? <Zap /> : <Activity />}
                  </div>
                  <div className={`text-xs font-black px-2 py-1 rounded-lg uppercase ${
                    problem.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {problem.severity}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 capitalize">{problem.type.replace('_', ' ')}</h4>
                  <p className="text-sm text-gray-500 mt-1">{problem.description}</p>
                  {problem.location && <p className="text-xs text-gray-400 mt-2 font-bold uppercase">Location: {problem.location}</p>}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Safety Assessment">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700">SAFETY RATING</span>
                <span className="font-black text-2xl text-[#065A82]">{result.safetyScore / 10}/10</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-black text-sm text-gray-900 mb-2 uppercase tracking-wider">Can I drive with this tyre?</h4>
                <p className="text-gray-600 font-bold">{result.verdict}</p>
              </div>
            </div>
          </Card>

          <Card title="Impact on Performance">
            <div className="space-y-4">
              <ImpactItem label="Fuel Efficiency" value={`-${result.fuelImpactPercentage}%`} color="text-red-500" />
              <ImpactItem label="Braking Distance" value="+8%" color="text-orange-500" />
              <ImpactItem label="Wet Grip" value="-15%" color="text-red-500" />
              <ImpactItem label="Remaining Life" value={result.urgency === 'immediate' ? 'REPLACE NOW' : '3-4 months'} color="text-gray-900" />
            </div>
          </Card>
        </div>

        <Card title="Immediate Recommendations" className="bg-[#21295C] text-white border-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="bg-white/10 p-6 rounded-2xl border border-white/10">
                <div className="font-black text-lg mb-2">{rec.action}</div>
                <div className="flex items-center justify-between text-sm opacity-70 font-bold">
                  <span>Timeline: {rec.timeline}</span>
                  {rec.safety && <span>Safety: {rec.safety}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Nearby Service Centers">
            <div className="space-y-4 mt-2">
              {nearbyCenters ? (
                nearbyCenters.map((center, i) => (
                  <ServiceCenter key={i} name={center.name} distance={center.distance} url={center.url} />
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 font-bold mb-4">Find real service centers near you</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#065A82] text-[#065A82]" 
                    onClick={findServiceCenters}
                    disabled={isFindingCenters}
                  >
                    {isFindingCenters ? 'Searching...' : 'Find Nearby Centers'}
                  </Button>
                </div>
              )}
              {!nearbyCenters && (
                <>
                  <ServiceCenter name="Tyre Plus Service" distance="2.1 km" price="₹4,200" />
                  <ServiceCenter name="Quick Fix Auto" distance="3.5 km" price="₹3,800" />
                </>
              )}
            </div>
          </Card>

          <Card title="History Comparison">
            <div className="flex items-center gap-4 mt-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">📉</div>
              <div>
                <div className="font-bold text-gray-900">Deterioration Rate</div>
                <div className="text-sm text-gray-500">13% in last 3 months</div>
              </div>
            </div>
            <p className="text-sm text-red-500 font-black mt-4 uppercase tracking-wider">Trend: Faster than normal wear</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tyre Health Scanner</h1>
        <p className="text-gray-500 font-bold mt-2">AI-powered visual analysis of your tyre's condition</p>
      </header>

      <Card className="p-0 overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50">
        <div 
          className="aspect-square relative flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? (
            <>
              <img src={image} alt="Tyre" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary">Change Photo</Button>
              </div>
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-32 h-32 border-4 border-[#1C7293] rounded-full flex items-center justify-center"
                  >
                    <div className="w-24 h-24 border-4 border-[#065A82] rounded-full animate-spin border-t-transparent" />
                  </motion.div>
                  <p className="mt-8 font-black text-xl text-[#065A82] animate-pulse">
                    {analysisSteps[analysisStep]}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-12">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-4xl text-[#065A82]">
                <Camera size={48} />
              </div>
              <h3 className="text-xl font-black text-gray-900">Upload Tyre Photo</h3>
              <p className="text-gray-500 font-bold mt-2">Take a clear photo of your tyre's surface</p>
              <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-400 font-bold uppercase tracking-wider">
                <span>📸 Show the tread pattern clearly</span>
                <span>JPG, PNG (max 5MB)</span>
              </div>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload} 
          />
        </div>
      </Card>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-black text-gray-900">How many years since last tyre change?</div>
            <div className="text-xs text-gray-500 font-bold">Helps AI estimate rubber aging</div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <button 
              onClick={() => setTyreAge(Math.max(0, tyreAge - 1))}
              className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-[#065A82] hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-8 text-center font-black text-gray-900">{tyreAge}</span>
            <button 
              onClick={() => setTyreAge(tyreAge + 1)}
              className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-[#065A82] hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <StarButton 
        lightColor={theme === 'dark' ? '#FAFAFA' : '#065A82'}
        className="w-full h-16 rounded-2xl text-xl font-black" 
        disabled={!image || isAnalyzing}
        onClick={startAnalysis}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Tyre Condition'}
      </StarButton>

      <Card title="What the AI detects" className="bg-gray-900 text-white border-none">
        <div className="grid grid-cols-2 gap-4 mt-2">
          <DetectionItem label="Tread Depth" />
          <DetectionItem label="Wear Patterns" />
          <DetectionItem label="Surface Cracks" />
          <DetectionItem label="Visible Damage" />
          <DetectionItem label="Rubber Aging" />
          <DetectionItem label="Foreign Objects" />
        </div>
      </Card>
    </div>
  );
}

function DetectionItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold opacity-80">
      <CheckCircle2 size={16} className="text-green-400" /> {label}
    </div>
  );
}

function ImpactItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="font-bold text-gray-600">{label}</span>
      <span className={`font-black ${color}`}>{value}</span>
    </div>
  );
}

const ServiceCenter: React.FC<ServiceCenterProps> = ({ name, distance, price, url }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div>
        <div className="font-bold text-gray-900">{name}</div>
        <div className="text-xs text-gray-500 font-bold flex items-center gap-1">
          <MapPin size={12} /> {distance}
        </div>
      </div>
      <div className="text-right">
        <div className="font-black text-[#065A82]">{price}</div>
        <button 
          onClick={() => url && window.open(url, '_blank')}
          className="text-[10px] font-black text-[#1C7293] uppercase tracking-wider flex items-center gap-1"
        >
          {url ? 'View on Maps' : 'Book'} <ArrowRight size={10} />
        </button>
      </div>
    </div>
  );
};
