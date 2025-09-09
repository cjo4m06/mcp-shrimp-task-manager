import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';

/**
 * CompletionAnalytics Component
 * Analyzes and displays statistics about task completions
 * Features:
 * - Common patterns and keyword analysis
 * - Technical challenges tracking
 * - Completion timeline visualization
 * - Agent performance metrics
 * - Date range and agent type filters
 * - Dark theme optimized
 * - Performance optimized with useMemo
 */
const CompletionAnalytics = ({ tasks = [] }) => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [filteredTasks, setFilteredTasks] = useState([]);

  // Dark theme colors
  const colors = {
    primary: '#4fbdba',
    secondary: '#7c3aed',
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#ef4444',
    background: '#1e293b',
    surface: '#334155',
    text: '#b8c5d6',
    chartColors: ['#4fbdba', '#7c3aed', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']
  };

  // Filter tasks based on selected criteria
  useEffect(() => {
    let filtered = tasks.filter(task => task.status === 'completed' && task.summary);

    // Apply date filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.completedAt || task.updatedAt);
        return taskDate >= filterDate;
      });
    }

    // Apply agent filter
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(task => 
        task.executedBy?.includes(selectedAgent) || 
        task.notes?.includes(selectedAgent)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, dateRange, selectedAgent]);

  // Calculate total completed tasks
  const totalCompleted = useMemo(() => filteredTasks.length, [filteredTasks]);

  // Extract and count keywords from accomplishments
  const keywordAnalysis = useMemo(() => {
    const keywords = {};
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'a', 'an']);
    
    filteredTasks.forEach(task => {
      if (task.summary) {
        // Extract key accomplishments section
        const accomplishmentsMatch = task.summary.match(/(?:Key Accomplishments|關鍵成就)([\s\S]*?)(?:Implementation Details|實施細節|Technical Challenges|技術挑戰|$)/i);
        if (accomplishmentsMatch) {
          const text = accomplishmentsMatch[1].toLowerCase();
          const words = text.match(/\b[a-z]+\b/g) || [];
          
          words.forEach(word => {
            if (word.length > 3 && !stopWords.has(word)) {
              keywords[word] = (keywords[word] || 0) + 1;
            }
          });
        }
      }
    });

    // Get top 10 keywords
    return Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({
        keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        count
      }));
  }, [filteredTasks]);

  // Extract and analyze technical challenges
  const challengeAnalysis = useMemo(() => {
    const challenges = {};
    
    filteredTasks.forEach(task => {
      if (task.summary) {
        // Extract technical challenges section
        const challengesMatch = task.summary.match(/(?:Technical Challenges|技術挑戰)([\s\S]*?)(?:$)/i);
        if (challengesMatch) {
          const text = challengesMatch[1];
          // Look for challenge patterns
          const challengePatterns = text.match(/(?:Challenge|挑戰|Problem|Issue)[:：]([^.!?\n]+)/gi) || [];
          
          challengePatterns.forEach(pattern => {
            const category = pattern.includes('performance') ? 'Performance' :
                           pattern.includes('compatibility') ? 'Compatibility' :
                           pattern.includes('security') ? 'Security' :
                           pattern.includes('integration') ? 'Integration' :
                           pattern.includes('testing') ? 'Testing' :
                           'Other';
            
            challenges[category] = (challenges[category] || 0) + 1;
          });
        }
      }
    });

    return Object.entries(challenges).map(([category, count]) => ({
      category,
      count
    }));
  }, [filteredTasks]);

  // Calculate completion timeline
  const timelineData = useMemo(() => {
    const timeline = {};
    
    filteredTasks.forEach(task => {
      const date = new Date(task.completedAt || task.updatedAt);
      const dateKey = date.toLocaleDateString();
      timeline[dateKey] = (timeline[dateKey] || 0) + 1;
    });

    // Sort by date and take last 30 days
    return Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30);
  }, [filteredTasks]);

  // Calculate agent performance metrics
  const agentMetrics = useMemo(() => {
    const metrics = {};
    
    filteredTasks.forEach(task => {
      const agent = task.executedBy || 'Unknown';
      if (!metrics[agent]) {
        metrics[agent] = {
          name: agent,
          completed: 0,
          avgScore: 0,
          scores: []
        };
      }
      
      metrics[agent].completed++;
      if (task.score) {
        metrics[agent].scores.push(task.score);
      }
    });

    // Calculate average scores
    Object.values(metrics).forEach(metric => {
      if (metric.scores.length > 0) {
        metric.avgScore = Math.round(
          metric.scores.reduce((a, b) => a + b, 0) / metric.scores.length
        );
      }
      delete metric.scores;
    });

    return Object.values(metrics).sort((a, b) => b.completed - a.completed);
  }, [filteredTasks]);

  // Extract unique agents for filter
  const uniqueAgents = useMemo(() => {
    const agents = new Set();
    tasks.forEach(task => {
      if (task.executedBy) agents.add(task.executedBy);
    });
    return Array.from(agents).sort();
  }, [tasks]);

  // Custom tooltip style
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.primary}`,
          borderRadius: '4px',
          padding: '8px',
          color: colors.text
        }}>
          <p>{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: colors.background,
      color: colors.text,
      minHeight: '100vh'
    }}>
      {/* Header with Filters */}
      <div style={{
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{ color: colors.primary, margin: 0 }}>
          📊 Completion Analytics Dashboard
        </h2>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.primary}`,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
          </select>

          {/* Agent Filter */}
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.primary}`,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Agents</option>
            {uniqueAgents.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: colors.surface,
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${colors.primary}`,
          textAlign: 'center'
        }}>
          <h3 style={{ color: colors.primary, margin: '0 0 10px 0' }}>
            Total Completed
          </h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>
            {totalCompleted}
          </p>
        </div>

        <div style={{
          backgroundColor: colors.surface,
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${colors.secondary}`,
          textAlign: 'center'
        }}>
          <h3 style={{ color: colors.secondary, margin: '0 0 10px 0' }}>
            Active Agents
          </h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>
            {agentMetrics.length}
          </p>
        </div>

        <div style={{
          backgroundColor: colors.surface,
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${colors.accent}`,
          textAlign: 'center'
        }}>
          <h3 style={{ color: colors.accent, margin: '0 0 10px 0' }}>
            Avg Completion/Day
          </h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>
            {timelineData.length > 0 
              ? (totalCompleted / timelineData.length).toFixed(1)
              : 0}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '30px'
      }}>
        {/* Completion Timeline */}
        {timelineData.length > 0 && (
          <div style={{
            backgroundColor: colors.surface,
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: colors.primary, marginBottom: '20px' }}>
              📈 Completion Timeline
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.background} />
                <XAxis 
                  dataKey="date" 
                  stroke={colors.text}
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke={colors.text} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke={colors.primary}
                  strokeWidth={2}
                  dot={{ fill: colors.primary, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Keywords */}
        {keywordAnalysis.length > 0 && (
          <div style={{
            backgroundColor: colors.surface,
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: colors.secondary, marginBottom: '20px' }}>
              🔤 Top Keywords in Accomplishments
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={keywordAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.background} />
                <XAxis 
                  dataKey="keyword" 
                  stroke={colors.text}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke={colors.text} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={colors.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Challenge Categories */}
        {challengeAnalysis.length > 0 && (
          <div style={{
            backgroundColor: colors.surface,
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: colors.warning, marginBottom: '20px' }}>
              ⚠️ Technical Challenges Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={challengeAnalysis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => 
                    `${category} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {challengeAnalysis.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors.chartColors[index % colors.chartColors.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Agent Performance */}
        {agentMetrics.length > 0 && (
          <div style={{
            backgroundColor: colors.surface,
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: colors.success, marginBottom: '20px' }}>
              🤖 Agent Performance Metrics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentMetrics.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.background} />
                <XAxis 
                  dataKey="name" 
                  stroke={colors.text}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke={colors.text} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="completed" fill={colors.success} name="Tasks Completed" />
                <Bar dataKey="avgScore" fill={colors.accent} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* No Data Message */}
      {filteredTasks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '50px',
          backgroundColor: colors.surface,
          borderRadius: '8px',
          marginTop: '30px'
        }}>
          <p style={{ fontSize: '1.2em', color: colors.text }}>
            📭 No completed tasks found for the selected filters.
          </p>
          <p style={{ color: colors.text, opacity: 0.7 }}>
            Try adjusting the date range or agent filter to see more data.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompletionAnalytics;