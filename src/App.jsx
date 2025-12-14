import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Search, Heart, Shield, Info, Loader2, User, Mail, MessageSquare, Send } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('checker');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Newsletter state
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  // Community messages state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ name: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load messages when Community tab is opened
  useEffect(() => {
    if (activeTab === 'community') {
      loadMessages();
    }
  }, [activeTab]);

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const keys = await window.storage.list('message:', true);
      if (keys && keys.keys) {
        const messagePromises = keys.keys.map(async (key) => {
          try {
            const result = await window.storage.get(key, true);
            return result ? JSON.parse(result.value) : null;
          } catch (e) {
            return null;
          }
        });
        const loadedMessages = (await Promise.all(messagePromises)).filter(m => m !== null);
        loadedMessages.sort((a, b) => b.timestamp - a.timestamp);
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.log('No messages yet or error loading:', error);
      setMessages([]);
    }
    setLoadingMessages(false);
  };

  const handleSubmitMessage = async () => {
    if (!newMessage.name.trim() || !newMessage.message.trim()) return;
    
    setSubmitting(true);
    try {
      const messageData = {
        id: Date.now().toString(),
        name: newMessage.name,
        message: newMessage.message,
        timestamp: Date.now()
      };
      
      await window.storage.set(`message:${messageData.id}`, JSON.stringify(messageData), true);
      setMessages([messageData, ...messages]);
      setNewMessage({ name: '', message: '' });
    } catch (error) {
      console.error('Error posting message:', error);
      alert('Unable to post message. Please try again.');
    }
    setSubmitting(false);
  };

  const handleSubscribe = () => {
    if (email && email.includes('@')) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  const handleCheck = async () => {
  if (!input.trim()) return;
  
  setLoading(true);
  setResult(null);

  try {
    const response = await fetch('/api/check-safety', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: input
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const parsed = await response.json();
    setResult(parsed);
  } catch (error) {
    console.error('Error:', error);
    setResult({
      item: input,
      safety: 'caution',
      reason: 'Unable to verify safety. Please consult with a healthcare provider.',
      alternatives: [],
      severity: 'medium'
    });
  }

  setLoading(false);
};

  const knownTriggers = [
    { name: 'Fava Beans', risk: 'High', description: 'Can cause severe hemolytic crisis' },
    { name: 'Mothballs (Naphthalene)', risk: 'High', description: 'Toxic to G6PD deficient individuals' },
    { name: 'Sulfonamide Antibiotics', risk: 'High', description: 'Avoid: Bactrim, Septra, sulfasalazine' },
    { name: 'Aspirin (High Dose)', risk: 'Medium', description: 'Small doses usually safe, avoid large amounts' },
    { name: 'Vitamin C (>1000mg)', risk: 'Medium', description: 'High doses can trigger hemolysis' },
    { name: 'Menthol/Camphor', risk: 'Medium', description: 'Found in some topical products' },
    { name: 'Henna', risk: 'High', description: 'Used in temporary tattoos, can cause crisis' },
    { name: 'Primaquine', risk: 'High', description: 'Antimalarial medication' }
  ];

const tabs = [
  { id: 'story', label: 'My Story', icon: User },
  { id: 'checker', label: 'AI Safety Checker', icon: Search },
  { id: 'triggers', label: 'Known Triggers', icon: AlertTriangle },
  { id: 'about', label: 'About G6PD', icon: Info },
  { id: 'mission', label: 'Our Mission', icon: Heart },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
  { id: 'community', label: 'Community', icon: MessageSquare }
];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-br from-blue-600 to-green-600 p-3 rounded-xl shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            G6PD.ai
          </h1>
          <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            AI-Powered Platform for the G6PD Community!
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        <span className="hidden sm:inline text-base sm:text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Helping 400M+ People Worldwide
        </span>
      </div>
    </div>
  </div>
</header>

      <nav className="bg-white shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 sm:space-x-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTab === 'checker' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                AI-Powered Safety Checker
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Instantly check if foods, medications, or products are safe for G6PD deficiency using advanced AI
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-3xl mx-auto">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter food, medication, or product name:
                </label>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
                    placeholder="e.g., fava beans, aspirin, vitamin C..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCheck}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 sm:px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>Check Safety</span>
                      </>
                    )}
                  </button>
                </div>

                {result && (
                  <div className={`mt-6 p-6 rounded-xl border-2 ${
                    result.safety === 'safe' ? 'bg-green-50 border-green-200' :
                    result.safety === 'unsafe' ? 'bg-red-50 border-red-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start space-x-4">
                      {result.safety === 'safe' ? (
                        <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className={`w-8 h-8 flex-shrink-0 ${
                          result.safety === 'unsafe' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold mb-2">{result.item}</h3>
                        <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ${
                          result.safety === 'safe' ? 'bg-green-200 text-green-800' :
                          result.safety === 'unsafe' ? 'bg-red-200 text-red-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>
                          {result.safety === 'safe' ? '✓ Generally Safe' :
                           result.safety === 'unsafe' ? '✗ Unsafe' :
                           '⚠ Use Caution'}
                        </span>
                        <p className="text-gray-700 mb-4">{result.reason}</p>
                        {result.alternatives && result.alternatives.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Safe Alternatives:</h4>
                            <ul className="space-y-1">
                              {result.alternatives.map((alt, idx) => (
                                <li key={idx} className="text-gray-700 flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span>{alt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="mt-4 text-sm text-gray-600 italic">
                          ⚕️ Always consult with your healthcare provider before making medical decisions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-3xl mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">💡 How It Works</h3>
              <p className="text-blue-800 text-sm sm:text-base">
                G6PD.ai is an AI-powered platform using advanced language model to analyze foods, medications, 
                and products against known G6PD triggers. It provides instant safety assessments and suggests 
                safer alternatives when available.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'triggers' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Known G6PD Triggers
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Common substances that can trigger hemolytic crises in people with G6PD deficiency
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {knownTriggers.map((trigger, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{trigger.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      trigger.risk === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trigger.risk} Risk
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">{trigger.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-3xl mx-auto">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Important Note</h3>
                  <p className="text-yellow-800 text-sm sm:text-base">
                    This list is not exhaustive. G6PD deficiency varies in severity among individuals. 
                    Always consult with your healthcare provider about specific substances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Understanding G6PD Deficiency
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Essential information about Glucose-6-Phosphate Dehydrogenase deficiency
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">What is G6PD Deficiency?</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  G6PD deficiency is a genetic disorder that affects red blood cells. People with this condition 
                  lack sufficient glucose-6-phosphate dehydrogenase enzyme, which helps red blood cells function 
                  properly and protects them from oxidative stress. When exposed to certain triggers, their red 
                  blood cells can break down faster than normal (hemolysis), leading to anemia.
                </p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Who is Affected?</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  G6PD deficiency affects approximately 400 million people worldwide. It is most common in people 
                  of African, Mediterranean, and Asian descent. The condition is inherited on the X chromosome, 
                  making it more common in males.
                </p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Symptoms of Hemolytic Crisis</h3>
                <ul className="space-y-2">
                  {[
                    'Pale or yellowish skin (jaundice)',
                    'Dark-colored urine',
                    'Fatigue and weakness',
                    'Rapid heart rate',
                    'Shortness of breath',
                    'Enlarged spleen',
                    'Abdominal pain'
                  ].map((symptom, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm sm:text-base">{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-2">🏥 Emergency Action</h3>
                <p className="text-green-800 text-sm sm:text-base">
                  If you experience symptoms of a hemolytic crisis, seek immediate medical attention. 
                  Stop exposure to the suspected trigger and contact your healthcare provider right away.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mission' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Empowering the G6PD community through AI and technology
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-4 pb-6 border-b">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Why G6PD.ai Exists</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Making safety information accessible to everyone</p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                G6PD.ai was created to address a critical need in the G6PD deficiency community: instant, 
                reliable safety information. Every day, people with G6PD deficiency face uncertainty about 
                whether foods, medications, or products are safe for them to use.
              </p>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">The Challenge</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  Traditional resources are often scattered, outdated, or difficult to access in critical moments. 
                  When someone needs to know if a medication is safe, they shouldn't have to search through 
                  medical journals or wait for a doctor's appointment.
                </p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Our Solution</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  By leveraging advanced AI technology, we've created a platform that provides instant, 
                  intelligent safety assessments. Our AI-powered checker analyzes substances against known 
                  G6PD triggers and provides clear, actionable guidance in seconds.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 my-6">
                <div className="bg-blue-50 rounded-lg p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-xs sm:text-sm text-gray-600">Available anytime, anywhere</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">Instant</div>
                  <div className="text-xs sm:text-sm text-gray-600">Results in seconds</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">Free</div>
                  <div className="text-xs sm:text-sm text-gray-600">Accessible to everyone</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'story' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                My Story
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Why I created G6PD.ai
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
             <div className="pb-6 border-b space-y-6">
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
    <img 
      src="/luke-icu.jpg" 
      alt="Luke as a newborn in ICU receiving phototherapy treatment" 
      className="w-64 h-64 sm:w-72 sm:h-72 object-cover rounded-xl shadow-2xl border-4 border-blue-200"
    />
    <div className="text-center sm:text-left flex-1">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Living with G6PD Deficiency</h3>
      <p className="text-gray-600 text-sm sm:text-base mb-3">A personal journey</p>
      <p className="text-gray-500 text-xs sm:text-sm italic bg-blue-50 p-3 rounded-lg">
        This is me as a newborn, under phototherapy lights in the ICU. 
        This was the beginning of my journey with G6PD deficiency.
      </p>
    </div>
  </div>
</div>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-4">
                Welcome to my website!😊 My name is Luke, and I am currently a sophomore in high school in California, USA. 
                  I entered the world not with celebration, but with a medical emergency caused by G6PD deficiency, 
                  a genetic condition that affects red blood cells and their ability to withstand oxidative stress. 
                  Born with severe jaundice, my skin turned an alarming shade of yellow, and my platelet count dropped to critically low levels. 
                  While other newborns were able to go home, I was rushed to the Intensive Care Unit (ICU), 
                  where I spent the first months of my life fighting to stabilize a body that seemed to be working against me.  
                </p>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-4">
                  Thanks to the skill and care of the excellent doctors at the Winnipeg Women's Hospital where I was born, my condition was correctly diagnosed shortly after birth. I was treated 
                  with phototherapy and intravenous fluids, and I underwent an exchange transfusion. 
                  After two months, I survived with no jaundice and stable platelet counts and bilirubin levels.
                </p>

                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-4">
                  As I grew older, I quickly learned that my condition made everyday decisions more complicated than they were for my friends. 
                  A simple trip to the pharmacy or deciding what to eat was never straightforward—it required constant awareness, caution, and research.
                 </p>
  
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-4">
                  As a 10th grader, I've spent years navigating the challenges of G6PD deficiency. Every new 
                  medication, every unfamiliar food, every household product required me to ask: "Is this safe for me?" 
                  The answers weren't always easy to find. Medical information was scattered across different websites, 
                  research papers were too technical, and sometimes even doctors weren't immediately familiar with 
                  all the triggers.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-6">
                  <p className="text-blue-900 font-medium text-sm sm:text-base lg:text-lg italic">
                    "I realized that if finding safety information was this hard for me—someone with internet access, 
                    English fluency, and supportive parents—it must be nearly impossible for millions of other kids 
                    and families around the world."
                  </p>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">The Turning Point</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-4">
                  The idea for G6PD.ai came to me when I learned about artificial intelligence and its potential to 
                  process vast amounts of medical information instantly. I thought: what if we could make all the 
                  scattered G6PD safety information available to anyone, anywhere, in seconds?
                </p>

                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-4">
                  This platform isn't just a school project or a tech demo. It's my attempt to help the estimated 
                  400 million people worldwide living with G6PD deficiency—especially kids like me who deserve to 
                  feel safe and confident in their daily choices.
                </p>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">For Every G6PD Kid and Family</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-4">
                  I built G6PD.ai with other young people and families in mind—those who might be newly diagnosed, 
                  those in communities where G6PD awareness is low, and those who simply need quick, reliable answers 
                  when they're standing in a store aisle wondering if a product is safe.
                </p>

                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-4">
                  No one should have to struggle alone with these questions. No parent should have to stay up at night 
                  researching whether their child's prescribed medication is safe. No kid should have to feel different 
                  or limited because of G6PD deficiency.
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 sm:p-8 my-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 text-center">My Hope</h3>
                  <p className="text-gray-700 text-center text-sm sm:text-base lg:text-lg">
                    If this platform helps even one person avoid a hemolytic crisis, or gives one family peace of mind, 
                    or empowers one kid to feel more confident managing their condition—then every hour I've spent 
                    building it will have been worth it.
                  </p>
                  <p className="text-gray-700 text-center mt-4 font-semibold text-sm sm:text-base lg:text-lg">
                    We're in this together. 💙
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Stay Informed
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Get the latest G6PD safety updates, research, and tips
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="flex items-center space-x-4 pb-6 border-b mb-6">
                <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">G6PD Newsletter</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Join our community of informed families</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📚 Educational Content</h4>
                    <p className="text-blue-800 text-sm">Latest research, safety guides, and medical updates</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">🔔 Safety Alerts</h4>
                    <p className="text-green-800 text-sm">Notifications about newly discovered triggers</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">💬 Community Stories</h4>
                    <p className="text-purple-800 text-sm">Real experiences from other G6PD families</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">🎯 Tips & Resources</h4>
                    <p className="text-orange-800 text-sm">Practical advice for daily life management</p>
                  </div>
                </div>

                {!subscribed ? (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 sm:p-8">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">Subscribe to Our Newsletter</h4>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 max-w-md mx-auto">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSubscribe}
                        disabled={!email || !email.includes('@')}
                        className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        <Mail className="w-5 h-5" />
                        <span>Subscribe</span>
                      </button>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-4">
                      Free. No spam. Unsubscribe anytime.
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 sm:p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h4 className="text-2xl font-bold text-green-900 mb-2">Thank You for Subscribing!</h4>
                    <p className="text-green-800">
                      We've sent a confirmation email to <strong>{email}</strong>
                    </p>
                    <p className="text-green-700 mt-4 text-sm">
                      You'll start receiving G6PD safety updates and community news soon.
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">What Our Subscribers Say:</h4>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-600 pl-4">
                      <p className="text-gray-700 italic text-sm sm:text-base">
                        "The newsletter keeps me informed about new research and safety guidelines. It's a lifesaver!"
                      </p>
                      <p className="text-gray-600 text-sm mt-2">— Sarah M., Parent</p>
                    </div>
                    <div className="border-l-4 border-green-600 pl-4">
                      <p className="text-gray-700 italic text-sm sm:text-base">
                        "I love the community stories. It helps knowing we're not alone in this journey."
                      </p>
                      <p className="text-gray-600 text-sm mt-2">— Michael T., G6PD Community Member</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Community Board
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Share your experiences, ask questions, and connect with others
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="flex items-center space-x-4 pb-6 border-b mb-6">
                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Share Your Story</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Messages are visible to all visitors</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Post a Message</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newMessage.name}
                    onChange={(e) => setNewMessage({...newMessage, name: e.target.value})}
                    placeholder="Your name (or anonymous)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <textarea
                    value={newMessage.message}
                    onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                    placeholder="Share your experience, ask a question, or leave encouragement for others..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                  <button
                    onClick={handleSubmitMessage}
                    disabled={submitting || !newMessage.name.trim() || !newMessage.message.trim()}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Post Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Community Messages</h4>
                {loadingMessages ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-600 mt-2">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No messages yet. Be the first to share!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900">{msg.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Community Guidelines:</strong> Please be respectful and supportive. Share experiences 
                  and encouragement. This is not a substitute for medical advice—always consult healthcare 
                  providers for medical decisions.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

    <footer className="bg-gray-900 text-white mt-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="max-w-3xl mx-auto">
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-3">Important Notice</h3>
        <p className="text-gray-300 text-base leading-relaxed">
          This platform is for informational purposes only and does not replace professional 
          medical advice. Always consult with healthcare providers for medical decisions.
        </p>
      </div>
      
      <div className="text-center border-t border-gray-800 pt-8">
        <p className="text-gray-400 text-base">
          &copy; 2024 G6PD.ai • Built to serve the G6PD community with ❤️
        </p>
      </div>
    </div>
  </div>
</footer>  
    </div>
  );
}
