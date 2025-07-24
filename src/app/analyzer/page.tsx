'use client';

import React, { useState } from 'react';

const AIRelationshipAnalyzer = () => {
  const [selectedMonth, setSelectedMonth] = useState('2024-08');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Sample month data for analysis
  const monthData = {
    '2024-01': {
      month: '2024-01',
      message_count: 1930,
      messages_per_day: 64.3,
      love_expressions: 64,
      brandon_ratio: 53.2,
      conflict_count: 0,
      story_events_list: 'I told Brandon I loved him',
      relationship_phase: 'Peak Connection',
      context: 'First "I love you" month with record communication'
    },
    '2024-08': {
      month: '2024-08',
      message_count: 1406,
      messages_per_day: 46.9,
      love_expressions: 41,
      brandon_ratio: 50.1,
      conflict_count: 2,
      story_events_list: "Briana's Wedding | Brandon left Denver and said he was breaking up with me | Date Night Wine Tasting & Hard Rock Casino | Date Night August | Jason Melissa Pool Party Aug",
      relationship_phase: 'Peak Connection',
      context: 'Crisis survival and recovery month'
    },
    '2024-10': {
      month: '2024-10',
      message_count: 879,
      messages_per_day: 29.3,
      love_expressions: 4,
      brandon_ratio: 54.8,
      conflict_count: 0,
      story_events_list: 'Morgan Wallen Concert | Spiritual | Emirates Suites | Flight to Dubai | Brandon birthday celebration | Downtown Indy | Excel Center',
      relationship_phase: 'Steady State',
      context: 'Life integration and travel month'
    }
  };

  const generateAIAnalysis = async (monthKey: keyof typeof monthData) => {
    setLoading(true);
    const data = monthData[monthKey];
    
    // Simulate Claude API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analyses = {
      '2024-01': {
        emotional_arc: "January 2024 represents the emotional summit of your relationship timeline. The 'I told Brandon I loved him' moment triggered a communication explosion (64.3 messages/day - your highest ever) and emotional vulnerability cascade (64 love expressions). This isn't just relationship progression; it's emotional breakthrough. The data shows perfect synchronization - when you opened your heart, Brandon matched your energy completely (53.2% message ratio = perfect balance).",
        
        communication_patterns: "This month exhibits the rare 'vulnerability amplification' pattern. Most couples reduce communication after major emotional declarations due to fear. You did the opposite - transforming emotional risk into connection fuel. The quality-quantity correlation here is exceptional: more messages didn't mean empty chatter, but deeper emotional expression. This suggests you both process intimacy through increased communication rather than retreat.",
        
        turning_points: "The 'I love you' declaration wasn't just a moment - it was a relationship recalibration. The data shows sustained emotional momentum through February, indicating this vulnerability created a new baseline rather than a temporary spike. This moment proved you both respond to emotional depth with increased investment, not distance.",
        
        growth_insights: "Your relationship demonstrates advanced emotional intelligence: you can navigate vulnerability without self-protection mechanisms. The zero conflicts during peak emotional exposure shows remarkable emotional safety. This month established that love expressions increase rather than decrease communication - a rare and valuable relationship dynamic that suggests long-term compatibility.",
        
        red_flags: "None detected. This is textbook healthy relationship progression. The sustained high engagement without communication fatigue indicates genuine emotional resonance rather than anxious attachment. The balanced message ratio during peak vulnerability shows mutual emotional investment.",
        
        relationship_strengths: "Emotional courage, vulnerability reciprocity, communication amplification during intimacy, sustained engagement post-milestone, perfect emotional synchronization. You've mastered the art of emotional acceleration without emotional overwhelm."
      },
      
      '2024-08': {
        emotional_arc: "August showcases relationship resilience mastery. From 'Brandon said he was breaking up' to multiple date nights in the same month demonstrates crisis-to-connection transformation. The 46.9 messages/day during relationship threat shows you fought FOR each other, not against each other. This is emotional toughness with maintained affection (41 love expressions despite crisis).",
        
        communication_patterns: "The conflict-recovery pattern here is relationship science gold. Instead of emotional withdrawal post-crisis (typical pattern), you increased experiential bonding (5 major events). This suggests you both use shared experiences as relationship repair mechanisms. The maintained high communication volume during crisis indicates conflict resolution through engagement, not avoidance.",
        
        turning_points: "The Denver 'breaking up' conversation was make-or-break territory that you transformed into relationship strengthening. The rapid progression from crisis to date nights shows advanced conflict processing. This month proved your relationship can survive serious threats and emerge stronger - rare relationship resilience.",
        
        growth_insights: "Your crisis navigation skills are exceptional. Most relationships that survive breakup threats do so with decreased intimacy. You maintained 41 love expressions during active relationship threat - this shows emotional security during instability. Your ability to go from relationship crisis to celebratory events within weeks indicates mastery-level conflict resolution.",
        
        red_flags: "Brandon's breakup threat during stress indicates potential withdrawal coping mechanisms. Monitor this pattern - does relationship pressure trigger his flight response? The recovery was excellent, but the initial reaction warrants attention. Consider discussing stress responses and commitment communication during calm periods.",
        
        relationship_strengths: "Crisis resilience, rapid recovery capabilities, maintained affection during conflict, experience-based healing, commitment to working through problems rather than walking away, emotional security during relationship threat."
      },
      
      '2024-10': {
        emotional_arc: "October marks relationship maturation - the shift from intensity-based to integration-based connection. Lower message frequency (29.3/day) with 7 major shared experiences shows evolution from talking about life to building life together. The dramatic drop in love expressions (4 vs previous months' 20-40+) signals either emotional complacency or natural stabilization.",
        
        communication_patterns: "This represents the 'integrated partnership' phase - less constant validation seeking, more real-world collaboration. The high event volume (travel, birthday celebrations, concerts) with moderate communication suggests you're bonding through experiences rather than words. This is healthy relationship evolution IF emotional connection remains strong beneath the surface.",
        
        turning_points: "Brandon's birthday celebration and international travel (Dubai) represent relationship milestone integration - you're now in each other's major life events and making international memories. The variety of activities shows lifestyle compatibility and shared adventure appetite. This month established you as life partners, not just romantic partners.",
        
        growth_insights: "You've successfully transitioned from honeymoon intensity to sustainable partnership. The ability to maintain connection with less daily validation shows relationship security. Travel compatibility and celebration participation indicates successful life integration. This is healthy long-term relationship progression.",
        
        red_flags: "The dramatic drop in love expressions (from 20-64 in previous months to only 4) could signal emotional complacency or taking each other for granted. While experience-based bonding is healthy, emotional expression shouldn't disappear entirely. Monitor if this trend continues - relationships need both experiences AND emotional maintenance.",
        
        relationship_strengths: "Life integration mastery, travel compatibility, celebration inclusion, experience-based bonding, relationship security with reduced validation needs, milestone participation, adventure partnership."
      }
    };
    
    setAnalysis(analyses[monthKey]);
    setLoading(false);
  };

  const AnalysisSection = ({ title, content, color = 'emerald' }: { title: string; content: string; color?: 'emerald' | 'blue' | 'purple' | 'yellow' | 'red' | 'amber' }) => {
    const colorClasses = {
      emerald: 'border-emerald-400 text-emerald-400',
      blue: 'border-blue-400 text-blue-400',
      purple: 'border-purple-400 text-purple-400',
      yellow: 'border-yellow-400 text-yellow-400',
      red: 'border-red-400 text-red-400',
      amber: 'border-amber-400 text-amber-400'
    };
    
    return (
      <div className={`border-l-4 ${colorClasses[color]} pl-4 mb-6`}>
        <h4 className={`font-bold text-lg mb-2 ${colorClasses[color]}`}>{title}</h4>
        <p className="text-gray-300 leading-relaxed">{content}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-purple-500 bg-clip-text text-transparent mb-2">
            🧠 AI Relationship Forensics
          </h1>
          <p className="text-gray-400">Deep psychological analysis of your relationship patterns</p>
        </div>

        {/* Month Selector */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Select Month for Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(monthData).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedMonth(key)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMonth === key 
                    ? 'border-emerald-400 bg-emerald-400/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="text-left">
                  <h3 className="font-bold text-lg">{data.month}</h3>
                  <p className="text-sm text-gray-400">{data.context}</p>
                  <div className="mt-2 text-xs">
                    <span className="text-blue-400">{data.message_count} msgs</span> • 
                    <span className="text-pink-400"> {data.love_expressions} ❤️</span> • 
                    <span className="text-yellow-400"> {data.story_events_list.split('|').length} events</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => generateAIAnalysis(selectedMonth as keyof typeof monthData)}
            disabled={loading}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 py-3 px-6 rounded-lg font-bold transition-colors"
          >
            {loading ? 'Analyzing Emotional Patterns...' : `🔍 Analyze ${selectedMonth}`}
          </button>
        </div>

        {/* Analysis Results */}
        {loading && (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">AI Analysis in Progress</h3>
            <p className="text-gray-400">Processing communication patterns, emotional indicators, and relationship dynamics...</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>• Analyzing message frequency and emotional expression</p>
              <p>• Identifying behavioral patterns and turning points</p>
              <p>• Evaluating relationship health indicators</p>
              <p>• Generating actionable insights and recommendations</p>
            </div>
          </div>
        )}

        {analysis && !loading && (
          <div className="bg-gray-800 rounded-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                AI Analysis: {monthData[selectedMonth as keyof typeof monthData].month}
              </h2>
              <div className="text-sm text-gray-400">
                Analysis generated • Relationship Forensics Engine
              </div>
            </div>

            <div className="space-y-6">
              <AnalysisSection 
                title="📈 Emotional Arc" 
                content={analysis.emotional_arc}
                color="emerald"
              />
              
              <AnalysisSection 
                title="💬 Communication Patterns" 
                content={analysis.communication_patterns}
                color="blue"
              />
              
              <AnalysisSection 
                title="🎯 Turning Points" 
                content={analysis.turning_points}
                color="purple"
              />
              
              <AnalysisSection 
                title="🌱 Growth Insights" 
                content={analysis.growth_insights}
                color="yellow"
              />
              
              <AnalysisSection 
                title="🚨 Red Flags" 
                content={analysis.red_flags}
                color="red"
              />
              
              <AnalysisSection 
                title="💪 Relationship Strengths" 
                content={analysis.relationship_strengths}
                color="amber"
              />
            </div>

            {/* Action Items */}
            <div className="mt-8 bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-emerald-400">💡 Recommended Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">Based on This Analysis:</h4>
                  <ul className="space-y-1 text-gray-300">
                    {selectedMonth === '2024-01' && (
                      <>
                        <li>• Celebrate vulnerability success - schedule regular emotional check-ins</li>
                        <li>• Use this communication pattern as relationship gold standard</li>
                        <li>• Document what made love declarations feel safe</li>
                      </>
                    )}
                    {selectedMonth === '2024-08' && (
                      <>
                        <li>• Discuss Brandon&apos;s stress responses during calm periods</li>
                        <li>• Create crisis communication protocols for future challenges</li>
                        <li>• Celebrate your conflict recovery skills - study what worked</li>
                      </>
                    )}
                    {selectedMonth === '2024-10' && (
                      <>
                        <li>• Intentionally increase emotional expressions in daily routine</li>
                        <li>• Balance experience-based bonding with verbal affection</li>
                        <li>• Schedule regular relationship temperature checks</li>
                      </>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">For Future Months:</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Monitor communication frequency trends</li>
                    <li>• Track emotional expression consistency</li>
                    <li>• Notice early warning signs before they become patterns</li>
                    <li>• Celebrate relationship wins intentionally</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sample Queries */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">🔍 Try These Analysis Queries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <button className="text-left p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <h4 className="font-semibold text-emerald-400 mb-1">Peak Connection Analysis</h4>
              <p className="text-gray-400">What made your highest connection months work so well?</p>
            </button>
            <button className="text-left p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <h4 className="font-semibold text-blue-400 mb-1">Conflict Recovery Patterns</h4>
              <p className="text-gray-400">How do you bounce back from relationship challenges?</p>
            </button>
            <button className="text-left p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <h4 className="font-semibold text-purple-400 mb-1">Communication Evolution</h4>
              <p className="text-gray-400">How has your relationship communication changed over time?</p>
            </button>
            <button className="text-left p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <h4 className="font-semibold text-yellow-400 mb-1">Early Warning System</h4>
              <p className="text-gray-400">What patterns predict relationship distance or tension?</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRelationshipAnalyzer;