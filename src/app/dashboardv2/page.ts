import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';

const UnmaskDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [connectednessScore, setConnectednessScore] = useState(null);

  // Load and parse CSV data
  const loadMessages = async () => {
    setLoading(true);
    try {
      const csvContent = await window.fs.readFile('Messages  Brandon Clymer.csv', { encoding: 'utf8' });
      
      // Parse CSV
      const Papa = await import('papaparse');
      const parsed = Papa.parse(csvContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });

      // Filter out messages without content and process dates
      const processedMessages = parsed.data
        .filter(msg => msg.message && msg.message.trim())
        .map(msg => ({
          ...msg,
          date: new Date(msg.date_time),
          isOutgoing: msg.type === 'Outgoing',
          wordCount: msg.message.split(' ').length,
          charCount: msg.message.length
        }))
        .sort((a, b) => a.date - b.date);

      setMessages(processedMessages);
      analyzeRelationship(processedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Analyze relationship patterns
  const analyzeRelationship = (msgs) => {
    if (!msgs.length) return;

    // Group by month for trends
    const monthlyData = {};
    const dailyData = {};

    msgs.forEach(msg => {
      const monthKey = `${msg.date.getFullYear()}-${String(msg.date.getMonth() + 1).padStart(2, '0')}`;
      const dayKey = msg.date.toISOString().split('T')[0];

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { 
          outgoing: 0, 
          incoming: 0, 
          totalWords: 0, 
          avgWordLength: 0,
          period: monthKey
        };
      }

      if (!dailyData[dayKey]) {
        dailyData[dayKey] = { 
          outgoing: 0, 
          incoming: 0, 
          totalMessages: 0,
          date: dayKey
        };
      }

      if (msg.isOutgoing) {
        monthlyData[monthKey].outgoing++;
        dailyData[dayKey].outgoing++;
      } else {
        monthlyData[monthKey].incoming++;
        dailyData[dayKey].incoming++;
      }

      monthlyData[monthKey].totalWords += msg.wordCount;
      dailyData[dayKey].totalMessages++;
    });

    // Calculate connectedness score
    const recent6Months = Object.values(monthlyData).slice(-6);
    const avgMessagesPerMonth = recent6Months.reduce((sum, month) => 
      sum + month.outgoing + month.incoming, 0) / recent6Months.length;
    
    const avgWordsPerMessage = recent6Months.reduce((sum, month) => 
      sum + month.totalWords, 0) / recent6Months.reduce((sum, month) => 
      sum + month.outgoing + month.incoming, 0);

    // Simple connectedness algorithm (can be enhanced with sentiment analysis)
    let score = 5; // baseline
    if (avgMessagesPerMonth > 300) score += 2;
    if (avgMessagesPerMonth > 500) score += 1;
    if (avgWordsPerMessage > 8) score += 1;
    if (avgWordsPerMessage > 15) score += 1;
    
    score = Math.min(10, Math.max(1, score));

    setConnectednessScore(score);

    // Prepare chart data
    const monthlyChart = Object.values(monthlyData).map(month => ({
      ...month,
      total: month.outgoing + month.incoming,
      ratio: month.outgoing / (month.incoming || 1)
    }));

    const dailyChart = Object.values(dailyData)
      .slice(-90) // Last 90 days
      .map(day => ({
        ...day,
        total: day.outgoing + day.incoming
      }));

    setAnalysis({
      totalMessages: msgs.length,
      dateRange: {
        start: msgs[0]?.date,
        end: msgs[msgs.length - 1]?.date
      },
      monthlyData: monthlyChart,
      dailyData: dailyChart,
      outgoingCount: msgs.filter(m => m.isOutgoing).length,
      incomingCount: msgs.filter(m => !m.isOutgoing).length,
      avgWordsPerMessage
    });
  };

  const getConnectionInsight = (score) => {
    if (score >= 9) return { text: "Deep Soul Connection", color: "text-green-400", desc: "You're in the zone. This is what love looks like in data." };
    if (score >= 7) return { text: "Strong Bond", color: "text-blue-400", desc: "Solid connection. You're both showing up." };
    if (score >= 5) return { text: "Moderate Connection", color: "text-yellow-400", desc: "You're maintaining, but there's room to deepen." };
    if (score >= 3) return { text: "Drifting Apart", color: "text-orange-400", desc: "Warning signs. Time for intentional reconnection." };
    return { text: "Emotionally Distant", color: "text-red-400", desc: "Critical state. Major intervention needed." };
  };

  useEffect(() => {
    loadMessages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your relationship data...</div>
      </div>
    );
  }

  const connectionInsight = connectednessScore ? getConnectionInsight(connectednessScore) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-purple-800 bg-black/20 backdrop-blur">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🥽 Unmask
              </h1>
              <p className="text-purple-300 mt-1">Raw, brutally honest relationship intelligence</p>
            </div>
            {connectednessScore && (
              <div className="text-right">
                <div className="text-4xl font-bold">{connectednessScore}/10</div>
                <div className={`text-sm ${connectionInsight.color}`}>
                  {connectionInsight.text}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {analysis ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur border border-purple-800/30">
                <div className="text-2xl font-bold text-purple-400">{analysis.totalMessages.toLocaleString()}</div>
                <div className="text-purple-300">Total Messages</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur border border-purple-800/30">
                <div className="text-2xl font-bold text-green-400">{analysis.outgoingCount.toLocaleString()}</div>
                <div className="text-purple-300">You Sent</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur border border-purple-800/30">
                <div className="text-2xl font-bold text-blue-400">{analysis.incomingCount.toLocaleString()}</div>
                <div className="text-purple-300">They Sent</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur border border-purple-800/30">
                <div className="text-2xl font-bold text-pink-400">{analysis.avgWordsPerMessage.toFixed(1)}</div>
                <div className="text-purple-300">Avg Words/Message</div>
              </div>
            </div>

            {/* Connectedness Insight */}
            {connectionInsight && (
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-700/50">
                <h3 className="text-xl font-bold mb-3">Current Connection State</h3>
                <div className={`text-lg font-semibold ${connectionInsight.color} mb-2`}>
                  {connectionInsight.text} ({connectednessScore}/10)
                </div>
                <p className="text-purple-200">{connectionInsight.desc}</p>
              </div>
            )}

            {/* Monthly Communication Trends */}
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur border border-purple-800/30">
              <h3 className="text-xl font-bold mb-4">Monthly Message Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analysis.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="outgoing" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="You Sent"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="incoming" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="They Sent"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Activity (Last 90 Days) */}
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur border border-purple-800/30">
              <h3 className="text-xl font-bold mb-4">Daily Activity - Last 90 Days</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analysis.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={false} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="total" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Relationship Timeline */}
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur border border-purple-800/30">
              <h3 className="text-xl font-bold mb-4">The Brutal Truth</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-purple-900/30 rounded-lg">
                  <span>Conversation started:</span>
                  <span className="font-semibold">{analysis.dateRange.start?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-900/30 rounded-lg">
                  <span>Most recent message:</span>
                  <span className="font-semibold">{analysis.dateRange.end?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-900/30 rounded-lg">
                  <span>Who texts more:</span>
                  <span className="font-semibold">
                    {analysis.outgoingCount > analysis.incomingCount ? 'You do' : 'They do'} 
                    ({Math.abs((analysis.outgoingCount / analysis.incomingCount - 1) * 100).toFixed(1)}% difference)
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-xl text-purple-300">No data loaded yet</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnmaskDashboard;