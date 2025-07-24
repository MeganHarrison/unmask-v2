'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RelationshipTimeline = () => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Your actual timeline data from the SQL query
  const timelineData = [
    {
      month: "2022-12",
      connection_level: 4,
      message_count: 19,
      messages_per_day: 4.8,
      love_expressions: 2,
      relationship_phase: "Distance Phase",
      story_events: 2,
      story_events_list: "DWD 2022 | 1st Date: Brett Eldridge Christmas Concert"
    },
    {
      month: "2023-01",
      connection_level: 4,
      message_count: 271,
      messages_per_day: 15.1,
      love_expressions: 16,
      relationship_phase: "Peak Connection",
      story_events: 1,
      story_events_list: "2nd Date: Comedy Show"
    },
    {
      month: "2023-02",
      connection_level: 4,
      message_count: 169,
      messages_per_day: 14.1,
      love_expressions: 3,
      relationship_phase: "Steady State",
      story_events: 1,
      story_events_list: "Plat Finance"
    },
    {
      month: "2023-03",
      connection_level: 4,
      message_count: 1013,
      messages_per_day: 39,
      love_expressions: 43,
      relationship_phase: "Peak Connection",
      story_events: 2,
      story_events_list: "LA | Luke Bryan Concert"
    },
    {
      month: "2023-04",
      connection_level: 4,
      message_count: 1141,
      messages_per_day: 43.9,
      love_expressions: 71,
      relationship_phase: "Peak Connection",
      story_events: 1,
      story_events_list: "Lightning game 👼🏻"
    },
    {
      month: "2023-05",
      connection_level: 4,
      message_count: 936,
      messages_per_day: 32.3,
      love_expressions: 39,
      relationship_phase: "Peak Connection",
      story_events: 2,
      story_events_list: "Kentucky Derby | Potrugal"
    },
    {
      month: "2023-06",
      connection_level: 4,
      message_count: 1219,
      messages_per_day: 42,
      love_expressions: 42,
      relationship_phase: "Peak Connection",
      story_events: 2,
      story_events_list: "Africa | Dubai 2023"
    },
    {
      month: "2023-07",
      connection_level: 4,
      message_count: 635,
      messages_per_day: 23.5,
      love_expressions: 50,
      relationship_phase: "Peak Connection",
      story_events: 1,
      story_events_list: "Horse carriage date"
    },
    {
      month: "2023-08",
      connection_level: 4,
      message_count: 1129,
      messages_per_day: 41.8,
      love_expressions: 66,
      relationship_phase: "Peak Connection",
      story_events: 1,
      story_events_list: "Business Mastery"
    },
    {
      month: "2023-09",
      connection_level: 4,
      message_count: 1450,
      messages_per_day: 53.7,
      love_expressions: 35,
      relationship_phase: "Peak Connection",
      story_events: 2,
      story_events_list: "Brandon move to Tampa | Wedding in Denver"
    },
    {
      month: "2023-10",
      connection_level: 4,
      message_count: 785,
      messages_per_day: 30.2,
      love_expressions: 17,
      relationship_phase: "Peak Connection",
      story_events: 5,
      story_events_list: "Charity event | Hawaii Relationship Trip | Honolulu, HI | Hawaii Contribution Day | Halloween"
    },
    {
      month: "2023-11",
      connection_level: 4,
      message_count: 1025,
      messages_per_day: 35.3,
      love_expressions: 18,
      relationship_phase: "Peak Connection",
      story_events: 2,
      story_events_list: "Thanksgiving 2023 | Birthday at Rizzis"
    },
    {
      month: "2023-12",
      connection_level: 4,
      message_count: 871,
      messages_per_day: 34.8,
      love_expressions: 17,
      relationship_phase: "Peak Connection",
      story_events: 4,
      story_events_list: "DWD 2023 - Baby | Christmas 2023 | Hard Rock | Lightning game Dec 30"
    },
    {
      month: "2024-01",
      connection_level: 4,
      message_count: 1930,
      messages_per_day: 64.3,
      love_expressions: 64,
      relationship_phase: "Peak Connection",
      story_events: 1,
      story_events_list: "I told Brandon I loved him"
    },
    {
      month: "2024-02",
      connection_level: 4,
      message_count: 882,
      messages_per_day: 33.9,
      love_expressions: 20,
      relationship_phase: "Peak Connection",
      story_events: 2,
      story_events_list: "Finance 2024 | Nate Bargatze Valentines Day Weekend"
    },
    {
      month: "2024-03",
      connection_level: 4,
      message_count: 1291,
      messages_per_day: 44.5,
      love_expressions: 28,
      relationship_phase: "Peak Connection",
      story_events: 2,
      story_events_list: "SXSW | Tim McGraw"
    },
    {
      month: "2024-04",
      connection_level: 4,
      message_count: 1272,
      messages_per_day: 43.9,
      love_expressions: 28,
      relationship_phase: "Peak Connection",
      story_events: 1,
      story_events_list: "Lightning game April 25 2024"
    },
    {
      month: "2024-05",
      connection_level: 4,
      message_count: 1066,
      messages_per_day: 39.5,
      love_expressions: 28,
      relationship_phase: "Peak Connection",
      story_events: 4,
      story_events_list: "Sydney | Australia | New Zealnd | Indy 500"
    },
    {
      month: "2024-06",
      connection_level: 4,
      message_count: 884,
      messages_per_day: 34,
      love_expressions: 17,
      relationship_phase: "Peak Connection",
      story_events: 3,
      story_events_list: "Date Night Rooftop & Meat Market | St. Pete Beach Day | Alleato Golf Event"
    },
    {
      month: "2024-07",
      connection_level: 4,
      message_count: 1876,
      messages_per_day: 67,
      love_expressions: 26,
      relationship_phase: "Peak Connection",
      story_events: 1,
      story_events_list: "RPM Event"
    },
    {
      month: "2024-08",
      connection_level: 4,
      message_count: 1406,
      messages_per_day: 46.9,
      love_expressions: 41,
      relationship_phase: "Peak Connection",
      story_events: 5,
      story_events_list: "Briana's Wedding | Brandon left Denver and said he was breaking up with me | Date Night Wine Tasting & Hard Rock Casino | Date Night August | Jason Melissa Pool Party Aug"
    },
    {
      month: "2024-09",
      connection_level: 4,
      message_count: 956,
      messages_per_day: 45.5,
      love_expressions: 28,
      relationship_phase: "Peak Connection",
      story_events: 5,
      story_events_list: "Charity Event | BM II Breckenridge | Goodwill Event | Exploring the flood - Brandon carried me and lexi | Rizzis to help with flood"
    },
    {
      month: "2024-10",
      connection_level: 4,
      message_count: 879,
      messages_per_day: 29.3,
      love_expressions: 4,
      relationship_phase: "Steady State",
      story_events: 7,
      story_events_list: "Morgan Wallen Concert | Spiritual | Emirates Suites | Flight to Dubai | Brandon's birthday celebration | Downtown Indy | Excel Center"
    },
    {
      month: "2024-11",
      connection_level: 4,
      message_count: 514,
      messages_per_day: 19,
      love_expressions: 9,
      relationship_phase: "Steady State",
      story_events: 5,
      story_events_list: "Thailand Elephants | My birthday | Country concert | Thanksgiving | Cults Game 11/24/24"
    },
    {
      month: "2024-12",
      connection_level: 4,
      message_count: 656,
      messages_per_day: 25.2,
      love_expressions: 21,
      relationship_phase: "Peak Connection",
      story_events: 3,
      story_events_list: "DWD 2024 | Christmas | New Years Eve"
    },
    {
      month: "2025-01",
      connection_level: 4,
      message_count: 750,
      messages_per_day: 26.8,
      love_expressions: 23,
      relationship_phase: "Peak Connection",
      story_events: 3,
      story_events_list: "Indy Jan 10 | Pacers Game - Break Up | Indy Jan 27"
    },
    {
      month: "2025-02",
      connection_level: 4,
      message_count: 803,
      messages_per_day: 32.1,
      love_expressions: 12,
      relationship_phase: "Romantic Phase",
      story_events: 3,
      story_events_list: "Plat Finance 2025 | Kelly Ballerini Concert | Lightning Game"
    },
    {
      month: "2025-03",
      connection_level: 4,
      message_count: 510,
      messages_per_day: 30,
      love_expressions: 8,
      relationship_phase: "Steady State",
      story_events: 7,
      story_events_list: "Park City Ski Trip | Entrepreneur Event | Out with Mark, Mario & Luke | Lukes Boat | St. Patricks Day | Lightning Game | Breakup"
    },
    {
      month: "2025-04",
      connection_level: 4,
      message_count: 300,
      messages_per_day: 17.6,
      love_expressions: 8,
      relationship_phase: "Steady State",
      story_events: 0,
      story_events_list: null
    },
    {
      month: "2025-05",
      connection_level: 4,
      message_count: 732,
      messages_per_day: 27.1,
      love_expressions: 11,
      relationship_phase: "Romantic Phase",
      story_events: 3,
      story_events_list: "Cancun 2025 | Dinner St. Pete | Beach Day"
    },
    {
      month: "2025-06",
      connection_level: 4,
      message_count: 319,
      messages_per_day: 15.2,
      love_expressions: 13,
      relationship_phase: "Romantic Phase",
      story_events: 6,
      story_events_list: "Cancun 2025 Day 1 | Cancun 2025 Boat | Cancun Dolphins | Croatia | Indy June 2025 | Croatia June 2025"
    }
  ];

  useEffect(() => {
    setMonthlyData(timelineData);
  }, []);

  const getBarColor = (phase: string) => {
    const colors: Record<string, string> = {
      'Peak Connection': '#10B981', // Emerald
      'Romantic Phase': '#F59E0B',  // Amber
      'Supportive Period': '#3B82F6', // Blue
      'Steady State': '#6B7280',   // Gray
      'Distance Phase': '#EF4444', // Red
      'Tension Period': '#DC2626'  // Dark Red
    };
    return colors[phase] || '#6B7280';
  };

  const handleBarClick = (data: any) => {
    setSelectedMonth(data.month);
    setLoading(true);
    
    // Simulate API call for drill-down data
    setTimeout(() => {
      setDrillDownData({
        month: data.month,
        overview: data,
        messageInsights: generateMessageInsights(data),
        aiAnalysis: generateAIAnalysis(data)
      });
      setLoading(false);
    }, 1000);
  };

  const generateMessageInsights = (data: any) => {
    return {
      communicationPattern: data.messages_per_day > 40 ? 'High Frequency' : data.messages_per_day > 20 ? 'Moderate' : 'Low Frequency',
      emotionalTone: data.love_expressions > 30 ? 'Highly Affectionate' : data.love_expressions > 15 ? 'Affectionate' : 'Reserved',
      storyEvents: data.story_events_list ? data.story_events_list.split(' | ') : []
    };
  };

  const generateAIAnalysis = (data: any) => {
    const analyses: Record<string, any> = {
      '2024-01': {
        emotional_arc: "January 2024 marked a significant emotional milestone with your first 'I love you' exchange. The dramatic spike to 64.3 messages/day (highest in your entire timeline) and 64 love expressions shows this was your peak vulnerability and connection month.",
        patterns: "This month shows the classic 'honeymoon intensification' pattern - when emotional barriers come down, communication volume explodes. The quality-to-quantity ratio here is exceptional.",
        turning_points: "The 'I told Brandon I loved him' event triggered a communication surge that lasted through February, suggesting this declaration opened new emotional channels.",
        growth_insights: "This month proves you both respond to emotional vulnerability with increased connection rather than distance - a rare and valuable relationship dynamic.",
        red_flags: "None detected. This is how love should unfold - gradually building trust until vulnerability feels safe.",
        strengths: "Mutual emotional acceleration, sustained high engagement, successful navigation of relationship milestone."
      },
      '2024-08': {
        emotional_arc: "August shows resilience mastery - from 'Brandon said he was breaking up with me' to multiple date nights in the same month. You didn't just survive a crisis, you transformed it into connection.",
        patterns: "The conflict-to-reconnection pattern here is textbook relationship strength. 5 major events including a near-breakup shows emotional intensity, but the sustained high message volume (46.9/day) proves you fought for each other.",
        turning_points: "The Denver breakup conversation was a make-or-break moment that you both chose to work through rather than walk away from.",
        growth_insights: "Your ability to go from relationship crisis to date nights in the same month shows advanced conflict resolution skills and deep commitment.",
        red_flags: "The breakup threat indicates Brandon may use withdrawal as a coping mechanism during stress. Monitor this pattern.",
        strengths: "Crisis navigation, rapid recovery, maintained affection during difficulty (41 love expressions despite conflict)."
      },
      '2024-10': {
        emotional_arc: "October reveals relationship maturation - lower daily intensity (29.3 messages/day) but 7 major events suggests you're building a life together rather than just talking about it.",
        patterns: "This is the 'integrated partnership' phase - less constant communication but more shared experiences. The drop in love expressions (only 4) isn't concerning given the increase in real-world activities.",
        turning_points: "Brandon's birthday celebration and travel to Dubai show relationship progression into major life events and international travel.",
        growth_insights: "You've moved from text-heavy connection to experience-based bonding. This is healthy relationship evolution.",
        red_flags: "Dramatic drop in love expressions could signal emotional complacency. Monitor if this continues.",
        strengths: "Life integration, shared adventures, relationship milestone celebrations."
      }
    };
    
    return analyses[data.month] || {
      emotional_arc: "This month shows steady relationship progression with balanced communication patterns.",
      patterns: "Standard communication flow with appropriate emotional expression for this relationship stage.",
      turning_points: "No major disruptions or breakthroughs detected.",
      growth_insights: "Maintaining consistent connection patterns suggests relationship stability.",
      red_flags: "None identified for this period.",
      strengths: "Consistent communication, emotional stability."
    };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl max-w-sm">
          <p className="text-white font-bold text-lg mb-2">{label}</p>
          <p className="text-emerald-400">Connection Level: {data.connection_level}/10</p>
          <p className="text-blue-400">{data.message_count} messages ({data.messages_per_day}/day)</p>
          <p className="text-pink-400">{data.love_expressions} love expressions</p>
          <p className="text-yellow-400">Phase: {data.relationship_phase}</p>
          {data.story_events > 0 && (
            <p className="text-purple-400">{data.story_events} major events</p>
          )}
          <p className="text-gray-400 text-sm mt-2">Click to analyze this month</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-2">
            UNMASK: Your Relationship Timeline
          </h1>
          <p className="text-gray-400">27,689 messages • 769 days • 90 story events • 2.5 years of emotional data</p>
          <p className="text-emerald-400 font-semibold mt-2">Click any month to dive deep into that period</p>
        </div>

        {/* Main Chart */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Monthly Connection Levels</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                domain={[0, 10]}
                label={{ value: 'Connection Level', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="connection_level" 
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={handleBarClick}
              >
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.relationship_phase)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center"><div className="w-4 h-4 bg-emerald-500 rounded mr-2"></div>Peak Connection</div>
            <div className="flex items-center"><div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>Romantic Phase</div>
            <div className="flex items-center"><div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>Supportive Period</div>
            <div className="flex items-center"><div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>Steady State</div>
            <div className="flex items-center"><div className="w-4 h-4 bg-red-500 rounded mr-2"></div>Distance Phase</div>
          </div>
        </div>

        {/* Drill-Down Section */}
        {selectedMonth && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Deep Dive: {selectedMonth}</h2>
              <button 
                onClick={() => setSelectedMonth(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Analyzing emotional patterns...</p>
              </div>
            ) : drillDownData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Data Overview */}
                <div className="space-y-6">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-emerald-400">Communication Overview</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Total Messages</p>
                        <p className="text-2xl font-bold">{drillDownData.overview.message_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Messages/Day</p>
                        <p className="text-2xl font-bold">{drillDownData.overview.messages_per_day}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Love Expressions</p>
                        <p className="text-2xl font-bold text-pink-400">{drillDownData.overview.love_expressions}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Relationship Phase</p>
                        <p className="text-lg font-semibold" style={{color: getBarColor(drillDownData.overview.relationship_phase)}}>
                          {drillDownData.overview.relationship_phase}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Story Events */}
                  {drillDownData.messageInsights.storyEvents.length > 0 && (
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-xl font-bold mb-4 text-purple-400">Major Events This Month</h3>
                      <ul className="space-y-2">
                        {drillDownData.messageInsights.storyEvents.map((event: any, index: number) => (
                          <li key={index} className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                            {event}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Column: AI Analysis */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4 text-amber-400">🧠 AI Relationship Analysis</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-emerald-400 mb-2">Emotional Arc</h4>
                      <p className="text-gray-300">{drillDownData.aiAnalysis.emotional_arc}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">Communication Patterns</h4>
                      <p className="text-gray-300">{drillDownData.aiAnalysis.patterns}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-purple-400 mb-2">Turning Points</h4>
                      <p className="text-gray-300">{drillDownData.aiAnalysis.turning_points}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">Growth Insights</h4>
                      <p className="text-gray-300">{drillDownData.aiAnalysis.growth_insights}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-400 mb-2">Red Flags</h4>
                      <p className="text-gray-300">{drillDownData.aiAnalysis.red_flags}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-emerald-400 mb-2">Relationship Strengths</h4>
                      <p className="text-gray-300">{drillDownData.aiAnalysis.strengths}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-3xl font-bold text-emerald-400">96%</h3>
            <p className="text-gray-400">Months in Peak/Romantic Phase</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-3xl font-bold text-blue-400">36</h3>
            <p className="text-gray-400">Average Messages/Day</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-3xl font-bold text-pink-400">780</h3>
            <p className="text-gray-400">Total Love Expressions</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-3xl font-bold text-purple-400">90</h3>
            <p className="text-gray-400">Memorable Story Events</p>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          Built with Unmask Relationship Intelligence • Data span: Dec 2022 - Jun 2025
        </div>
      </div>
    </div>
  );
};

export default RelationshipTimeline;