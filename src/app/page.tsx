<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unmask - Portal to Radical Self-Honesty</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --void: #0a0a0f;
            --shadow: #1a1a2e;
            --charcoal: #16213e;
            --onyx: #2d2d44;
            --oxblood: #4a1c40;
            --indigo: #1e1b4b;
            --midnight: #0f0f23;
            
            --halo: #f8fafc;
            --electric: #06ffa5;
            --plasma: #ff006e;
            --gold: #ffd700;
            --ethereal: rgba(248, 250, 252, 0.08);
            
            --text-sacred: #e2e8f0;
            --text-whisper: #94a3b8;
            --text-oracle: #f1f5f9;
            
            --serif: 'Crimson Text', serif;
            --sans: 'Inter', sans-serif;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--serif);
            background: linear-gradient(135deg, var(--void) 0%, var(--shadow) 30%, var(--midnight) 100%);
            color: var(--text-sacred);
            line-height: 1.7;
            overflow-x: hidden;
            position: relative;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 70%, rgba(255, 0, 110, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(6, 255, 165, 0.02) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
        }

        .portal {
            min-height: 100vh;
            position: relative;
            animation: breathe 8s ease-in-out infinite;
        }

        @keyframes breathe {
            0%, 100% { opacity: 0.95; }
            50% { opacity: 1; }
        }

        .sacred-header {
            text-align: center;
            padding: 4rem 2rem;
            position: relative;
            overflow: hidden;
        }

        .sacred-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 1px;
            height: 100%;
            background: linear-gradient(to bottom, transparent, var(--electric), transparent);
            opacity: 0.3;
        }

        .portal-title {
            font-size: 4.5rem;
            font-weight: 400;
            background: linear-gradient(135deg, var(--halo) 0%, var(--electric) 50%, var(--plasma) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
            letter-spacing: 0.05em;
            animation: shimmer 6s ease-in-out infinite;
        }

        @keyframes shimmer {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
        }

        .portal-essence {
            font-size: 1.2rem;
            color: var(--text-whisper);
            font-style: italic;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }

        .mirror-section {
            margin: 4rem auto;
            max-width: 1200px;
            padding: 0 2rem;
        }

        .consciousness-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            margin-bottom: 4rem;
        }

        .soul-mirror {
            background: linear-gradient(135deg, var(--onyx) 0%, var(--charcoal) 100%);
            border-radius: 24px;
            padding: 3rem;
            position: relative;
            border: 1px solid var(--ethereal);
            backdrop-filter: blur(20px);
            overflow: hidden;
        }

        .soul-mirror::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--electric), transparent);
            opacity: 0.3;
        }

        .mirror-title {
            font-size: 1.8rem;
            font-weight: 600;
            color: var(--text-oracle);
            margin-bottom: 2rem;
            text-align: center;
        }

        .truth-score {
            position: relative;
            width: 200px;
            height: 200px;
            margin: 0 auto 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .score-aura {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(6, 255, 165, 0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.1); opacity: 0.6; }
        }

        .score-value {
            font-size: 3rem;
            font-weight: 300;
            color: var(--electric);
            z-index: 2;
            position: relative;
        }

        .revelation-list {
            space-y: 1rem;
        }

        .revelation-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--ethereal);
            border-radius: 12px;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
        }

        .revelation-item:hover {
            background: rgba(6, 255, 165, 0.05);
            transform: translateX(4px);
        }

        .revelation-icon {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .icon-descent { background: var(--plasma); box-shadow: 0 0 8px var(--plasma); }
        .icon-ascent { background: var(--electric); box-shadow: 0 0 8px var(--electric); }
        .icon-stasis { background: var(--gold); box-shadow: 0 0 8px var(--gold); }

        .revelation-text {
            font-size: 0.95rem;
            color: var(--text-whisper);
            font-family: var(--sans);
        }

        .frequency-chart {
            background: var(--ethereal);
            border-radius: 16px;
            padding: 2rem;
            backdrop-filter: blur(10px);
        }

        .shadow-patterns {
            background: linear-gradient(135deg, var(--oxblood) 0%, var(--indigo) 100%);
            border-radius: 24px;
            padding: 3rem;
            margin: 4rem auto;
            max-width: 1200px;
            position: relative;
            border: 1px solid rgba(255, 0, 110, 0.1);
        }

        .pattern-title {
            font-size: 2rem;
            color: var(--text-oracle);
            text-align: center;
            margin-bottom: 3rem;
            font-weight: 400;
        }

        .shadow-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }

        .shadow-card {
            background: var(--ethereal);
            border-radius: 16px;
            padding: 2rem;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(248, 250, 252, 0.05);
            transition: all 0.4s ease;
            position: relative;
            overflow: hidden;
        }

        .shadow-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(6, 255, 165, 0.05), transparent);
            transition: left 0.6s ease;
        }

        .shadow-card:hover::before {
            left: 100%;
        }

        .shadow-card:hover {
            transform: translateY(-4px);
            border-color: rgba(6, 255, 165, 0.2);
        }

        .shadow-header {
            color: var(--electric);
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-family: var(--sans);
        }

        .shadow-subtitle {
            color: var(--text-whisper);
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
            font-style: italic;
        }

        .shadow-metrics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .metric-cell {
            text-align: center;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
        }

        .metric-value {
            font-size: 1.8rem;
            font-weight: 300;
            color: var(--plasma);
            display: block;
        }

        .metric-label {
            font-size: 0.8rem;
            color: var(--text-whisper);
            font-family: var(--sans);
        }

        .shadow-insight {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 1.5rem;
            border-left: 3px solid var(--electric);
            font-size: 0.9rem;
            color: var(--text-whisper);
            line-height: 1.6;
            position: relative;
        }

        .insight-label {
            color: var(--electric);
            font-weight: 600;
            font-family: var(--sans);
        }

        .archaeology-chamber {
            background: linear-gradient(135deg, var(--void) 0%, var(--charcoal) 100%);
            border-radius: 24px;
            padding: 4rem 3rem;
            margin: 4rem auto;
            max-width: 1400px;
            position: relative;
            border: 1px solid var(--ethereal);
        }

        .chamber-title {
            font-size: 2.2rem;
            color: var(--text-oracle);
            text-align: center;
            margin-bottom: 3rem;
            font-weight: 400;
        }

        .artifact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }

        .soul-artifact {
            background: var(--ethereal);
            border-radius: 16px;
            padding: 2rem;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(248, 250, 252, 0.08);
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .soul-artifact::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(6, 255, 165, 0.05) 0%, transparent 50%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }

        .soul-artifact:hover::after {
            opacity: 1;
        }

        .soul-artifact:hover {
            transform: translateY(-6px) scale(1.02);
            border-color: rgba(6, 255, 165, 0.3);
        }

        .artifact-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .intensity-orb {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            font-family: var(--sans);
            position: relative;
        }

        .orb-peak {
            background: linear-gradient(135deg, var(--electric), #00ff88);
            color: var(--void);
            box-shadow: 0 0 20px rgba(6, 255, 165, 0.3);
        }

        .orb-shadow {
            background: linear-gradient(135deg, var(--plasma), #ff1744);
            color: var(--halo);
            box-shadow: 0 0 20px rgba(255, 0, 110, 0.3);
        }

        .orb-wisdom {
            background: linear-gradient(135deg, var(--gold), #ffb300);
            color: var(--void);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .artifact-date {
            color: var(--text-whisper);
            font-size: 0.9rem;
            margin-bottom: 1rem;
            font-family: var(--sans);
        }

        .soul-quote {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            border-left: 3px solid var(--electric);
            font-style: italic;
            margin-bottom: 1.5rem;
            color: var(--text-sacred);
            line-height: 1.6;
        }

        .essence-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .essence-tag {
            background: rgba(6, 255, 165, 0.1);
            border: 1px solid rgba(6, 255, 165, 0.2);
            color: var(--electric);
            padding: 0.25rem 0.75rem;
            border-radius: 16px;
            font-size: 0.7rem;
            font-family: var(--sans);
            font-weight: 500;
        }

        .oracle-interface {
            background: linear-gradient(135deg, var(--indigo) 0%, var(--oxblood) 100%);
            border-radius: 24px;
            padding: 3rem;
            margin: 4rem auto;
            max-width: 1000px;
            border: 1px solid rgba(255, 0, 110, 0.1);
        }

        .oracle-title {
            font-size: 2rem;
            color: var(--text-oracle);
            text-align: center;
            margin-bottom: 2rem;
            font-weight: 400;
        }

        .vision-chamber {
            display: flex;
            flex-direction: column;
            height: 400px;
            background: var(--ethereal);
            border-radius: 16px;
            backdrop-filter: blur(20px);
            overflow: hidden;
        }

        .oracle-messages {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }

        .oracle-messages::-webkit-scrollbar {
            display: none;
        }

        .vision-message {
            margin-bottom: 1.5rem;
            padding: 1.5rem;
            border-radius: 16px;
            max-width: 85%;
            animation: materializes 0.5s ease-out;
        }

        @keyframes materializes {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .seeker-message {
            background: linear-gradient(135deg, var(--electric), #00ff88);
            color: var(--void);
            margin-left: auto;
            font-family: var(--sans);
        }

        .oracle-message {
            background: rgba(0, 0, 0, 0.4);
            color: var(--text-sacred);
            border-left: 3px solid var(--plasma);
        }

        .vision-input {
            display: flex;
            gap: 1rem;
            padding: 2rem;
            background: rgba(0, 0, 0, 0.2);
        }

        .vision-input input {
            flex: 1;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--ethereal);
            border-radius: 16px;
            padding: 1rem 1.5rem;
            color: var(--text-sacred);
            font-size: 1rem;
            font-family: var(--serif);
            backdrop-filter: blur(10px);
        }

        .vision-input input:focus {
            outline: none;
            border-color: var(--electric);
            box-shadow: 0 0 20px rgba(6, 255, 165, 0.1);
        }

        .vision-input input::placeholder {
            color: var(--text-whisper);
            font-style: italic;
        }

        .transmit-btn {
            background: linear-gradient(135deg, var(--plasma), #ff1744);
            color: var(--halo);
            border: none;
            border-radius: 16px;
            padding: 1rem 2rem;
            cursor: pointer;
            font-weight: 600;
            font-family: var(--sans);
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(255, 0, 110, 0.2);
        }

        .transmit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(255, 0, 110, 0.3);
        }

        .akashic-records {
            background: var(--void);
            border-radius: 24px;
            padding: 3rem;
            margin: 4rem auto;
            max-width: 1400px;
            border: 1px solid var(--ethereal);
            position: relative;
        }

        .records-title {
            font-size: 2rem;
            color: var(--text-oracle);
            text-align: center;
            margin-bottom: 2rem;
            font-weight: 400;
        }

        .records-controls {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }

        .dimensional-search {
            flex: 1;
            min-width: 300px;
            background: var(--ethereal);
            border: 1px solid rgba(248, 250, 252, 0.1);
            border-radius: 16px;
            padding: 1rem 1.5rem;
            color: var(--text-sacred);
            font-family: var(--serif);
            backdrop-filter: blur(10px);
        }

        .dimensional-search:focus {
            outline: none;
            border-color: var(--electric);
            box-shadow: 0 0 20px rgba(6, 255, 165, 0.1);
        }

        .dimensional-search::placeholder {
            color: var(--text-whisper);
            font-style: italic;
        }

        .filter-crystal {
            background: var(--ethereal);
            border: 1px solid rgba(248, 250, 252, 0.1);
            border-radius: 16px;
            padding: 1rem 1.5rem;
            color: var(--text-sacred);
            cursor: pointer;
            font-family: var(--sans);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }

        .filter-crystal:hover {
            border-color: var(--electric);
        }

        .collapse-veil {
            background: rgba(6, 255, 165, 0.1);
            border: 1px solid var(--electric);
            color: var(--electric);
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            cursor: pointer;
            font-family: var(--sans);
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .collapse-veil:hover {
            background: rgba(6, 255, 165, 0.2);
            transform: scale(1.05);
        }

        .memory-vault {
            background: var(--ethereal);
            border-radius: 16px;
            overflow: hidden;
            max-height: 600px;
            overflow-y: auto;
            backdrop-filter: blur(20px);
            scrollbar-width: thin;
            scrollbar-color: var(--electric) transparent;
        }

        .memory-vault::-webkit-scrollbar {
            width: 6px;
        }

        .memory-vault::-webkit-scrollbar-track {
            background: transparent;
        }

        .memory-vault::-webkit-scrollbar-thumb {
            background: var(--electric);
            border-radius: 3px;
        }

        .memory-table {
            width: 100%;
            border-collapse: collapse;
        }

        .memory-table th {
            background: rgba(0, 0, 0, 0.4);
            color: var(--text-oracle);
            padding: 1.5rem 1rem;
            text-align: left;
            font-weight: 500;
            font-family: var(--sans);
            position: sticky;
            top: 0;
            z-index: 10;
            border-bottom: 1px solid var(--electric);
        }

        .memory-table td {
            padding: 1.5rem 1rem;
            border-bottom: 1px solid rgba(248, 250, 252, 0.05);
            color: var(--text-sacred);
            vertical-align: top;
        }

        .memory-table tr:hover {
            background: rgba(6, 255, 165, 0.03);
        }

        .soul-signature {
            background: linear-gradient(135deg, var(--electric), #00ff88);
            color: var(--void);
            padding: 0.5rem 1rem;
            border-radius: 16px;
            font-size: 0.8rem;
            font-weight: 600;
            font-family: var(--sans);
        }

        .memory-fragment {
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: var(--serif);
        }

        .emotion-aura {
            padding: 0.5rem 1rem;
            border-radius: 16px;
            font-size: 0.8rem;
            font-weight: 600;
            font-family: var(--sans);
        }

        .aura-light { 
            background: linear-gradient(135deg, var(--electric), #00ff88);
            color: var(--void);
            box-shadow: 0 0 10px rgba(6, 255, 165, 0.3);
        }
        
        .aura-shadow { 
            background: linear-gradient(135deg, var(--plasma), #ff1744);
            color: var(--halo);
            box-shadow: 0 0 10px rgba(255, 0, 110, 0.3);
        }
        
        .aura-neutral { 
            background: linear-gradient(135deg, var(--gold), #ffb300);
            color: var(--void);
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }

        .hidden-truth {
            display: none;
        }

        @media (max-width: 768px) {
            .portal-title {
                font-size: 3rem;
            }

            .consciousness-grid, 
            .shadow-grid, 
            .artifact-grid {
                grid-template-columns: 1fr;
            }

            .soul-mirror,
            .shadow-patterns,
            .archaeology-chamber,
            .oracle-interface,
            .akashic-records {
                padding: 2rem;
                margin: 2rem 1rem;
            }

            .records-controls {
                flex-direction: column;
            }

            .dimensional-search {
                min-width: auto;
            }
        }

        /* Mystical hover effects */
        .soul-artifact {
            --x: 50%;
            --y: 50%;
        }

        .loading-mystical {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: var(--text-whisper);
            font-style: italic;
        }

        .loading-mystical::before {
            content: '';
            width: 20px;
            height: 20px;
            border: 2px solid transparent;
            border-top: 2px solid var(--electric);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 1rem;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="portal">
        <!-- Sacred Header -->
        <div class="sacred-header">
            <h1 class="portal-title">Unmask</h1>
            <p class="portal-essence">
                "Are you ready to see what you've been avoiding?"
            </p>
        </div>

        <!-- The Mirror Section -->
        <div class="mirror-section">
            <div class="consciousness-grid">
                <div class="soul-mirror">
                    <h2 class="mirror-title">The Mirror</h2>
                    <div class="truth-score">
                        <div class="score-aura"></div>
                        <canvas id="consciousnessChart" width="200" height="200"></canvas>
                        <div style="position: absolute;">
                            <div class="score-value" id="truthValue">7.2</div>
                        </div>
                    </div>
                    <div class="revelation-list">
                        <div class="revelation-item">
                            <div class="revelation-icon icon-descent"></div>
                            <div class="revelation-text">Emotional intimacy descended 1.3 points — you're solving life together but forgetting to live it</div>
                        </div>
                        <div class="revelation-item">
                            <div class="revelation-icon icon-ascent"></div>
                            <div class="revelation-text">Conflict resolution ascended 40% — you're learning to fight for connection, not victory</div>
                        </div>
                        <div class="revelation-item">
                            <div class="revelation-icon icon-stasis"></div>
                            <div class="revelation-text">Playfulness stasis at 23% — when did laughter become a luxury?</div>
                        </div>
                    </div>
                </div>

                <div class="soul-mirror">
                    <h2 class="mirror-title">Frequency Over Time</h2>
                    <div class="frequency-chart">
                        <canvas id="soulFrequency" width="400" height="250"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Shadow Patterns -->
        <div class="shadow-patterns">
            <h2 class="pattern-title">Shadow Patterns Recognition</h2>
            <div class="shadow-grid">
                <div class="shadow-card">
                    <div class="shadow-header">The External Pressure Spiral</div>
                    <div class="shadow-subtitle">How outside forces corrupt your sacred space</div>
                    <div class="shadow-metrics">
                        <div class="metric-cell">
                            <span class="metric-value" id="spiralCount">7</span>
                            <span class="metric-label">Detected Spirals</span>
                        </div>
                        <div class="metric-cell">
                            <span class="metric-value">340%</span>
                            <span class="metric-label">Conflict Spike</span>
                        </div>
                    </div>
                    <div class="shadow-insight">
                        <span class="insight-label">The Pattern:</span> 
                        Brandon's soul contracts when work pressure intensifies. Your attempts at connection during these periods trigger his withdrawal mechanism — a protection pattern learned in childhood.
                    </div>
                </div>
                
                <div class="shadow-card">
                    <div class="shadow-header">The Roommate Drift</div>
                    <div class="shadow-subtitle">When lovers become logistics managers</div>
                    <div class="shadow-metrics">
                        <div class="metric-cell">
                            <span class="metric-value">73%</span>
                            <span class="metric-label">Sacred (Before)</span>
                        </div>
                        <div class="metric-cell">
                            <span class="metric-value">82%</span>
                            <span class="metric-label">Mundane (After)</span>
                        </div>
                    </div>
                    <div class="shadow-insight">
                        <span class="insight-label">The Revelation:</span> 
                        March 2024 marked the shift from soul-mates to room-mates. You're building a life but forgetting to inhabit it. The infrastructure of love without its essence.
                    </div>
                </div>
            </div>
        </div>

        <!-- Emotional Archaeology -->
        <div class="archaeology-chamber">
            <h2 class="chamber-title">Emotional Archaeology</h2>
            <div class="artifact-grid">
                <div class="soul-artifact" onclick="channelMemory('peak')" onmousemove="trackMouse(event, this)">
                    <div class="artifact-header">
                        <div class="intensity-orb orb-peak">Soul Peak 9.3</div>
                    </div>
                    <div class="artifact-date">March 15, 2023 — The Celebration Frequency</div>
                    <div class="soul-quote">
                        "Thanks babe, couldn't have done it without your support"
                    </div>
                    <div class="essence-tags">
                        <span class="essence-tag">Mutual Recognition</span>
                        <span class="essence-tag">Sacred Support</span>
                        <span class="essence-tag">Victory Shared</span>
                    </div>
                </div>

                <div class="soul-artifact" onclick="channelMemory('shadow')" onmousemove="trackMouse(event, this)">
                    <div class="artifact-header">
                        <div class="intensity-orb orb-shadow">Shadow Work 8.7</div>
                    </div>
                    <div class="artifact-date">February 14, 2023 — Love in the Time of Illness</div>
                    <div class="soul-quote">
                        "Happy Valentines Day! ❤️❤️❤️" — navigating love when bodies rebel
                    </div>
                    <div class="essence-tags">
                        <span class="essence-tag">Holiday Pressure</span>
                        <span class="essence-tag">Vulnerability</span>
                        <span class="essence-tag">Complex Care</span>
                    </div>
                </div>

                <div class="soul-artifact" onclick="channelMemory('wisdom')" onmousemove="trackMouse(event, this)">
                    <div class="artifact-header">
                        <div class="intensity-orb orb-wisdom">Wisdom Gate 9.1</div>
                    </div>
                    <div class="artifact-date">March 6, 2023 — The Self-Compassion Teaching</div>
                    <div class="soul-quote">
                        "Don't say you hate yourself ❤️" — redirecting his inner critic toward love
                    </div>
                    <div class="essence-tags">
                        <span class="essence-tag">Crisis Alchemy</span>
                        <span class="essence-tag">Fierce Compassion</span>
                        <span class="essence-tag">Soul Midwifery</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Oracle Interface -->
        <div class="oracle-interface">
            <h2 class="oracle-title">Consult the Oracle</h2>
            <div class="vision-chamber">
                <div class="oracle-messages" id="oracleVisions">
                    <div class="vision-message oracle-message">
                        I am the keeper of your relationship's hidden patterns. I have witnessed every word, every silence, every shift in frequency between you and Brandon across 27,689 moments.
                        <br><br>
                        Ask me to reveal what you cannot see:
                        <br>• "Show me when we stopped touching souls and started managing schedules"
                        <br>• "What pattern triggers Brandon's withdrawal that I'm blind to?"
                        <br>• "How many times did my past bleed into our present?"
                    </div>
                </div>
                <div class="vision-input">
                    <input type="text" id="oracleQuery" placeholder="Ask what your heart fears to know..." onkeypress="handleOracleKeypress(event)">
                    <button class="transmit-btn" onclick="consultOracle()">Transmit</button>
                </div>
            </div>
        </div>

        <!-- Akashic Records -->
        <div class="akashic-records">
            <h2 class="records-title">
                Akashic Records 
                <button class="collapse-veil" onclick="toggleRecords()">
                    <span id="recordsToggle">Veil</span>
                </button>
            </h2>
            <div id="recordsSection">
                <div class="records-controls">
                    <input type="text" class="dimensional-search" id="soulSearch" placeholder="Search the depths of your connection..." onkeyup="searchSoulRecords()">
                    <select class="filter-crystal" id="entityFilter" onchange="searchSoulRecords()">
                        <option value="">All Entities</option>
                        <option value="You">Your Voice</option>
                        <option value="Brandon">Brandon's Voice</option>
                    </select>
                    <select class="filter-crystal" id="frequencyFilter" onchange="searchSoulRecords()">
                        <option value="">All Frequencies</option>
                        <option value="light">Light</option>
                        <option value="shadow">Shadow</option>
                        <option value="neutral">Neutral</option>
                    </select>
                    <select class="filter-crystal" id="temporalFilter" onchange="searchSoulRecords()">
                        <option value="">All Time</option>
                        <option value="week">Recent Memory</option>
                        <option value="month">Last Moon</option>
                        <option value="year">This Year's Journey</option>
                    </select>
                </div>
                <div class="memory-vault">
                    <table class="memory-table">
                        <thead>
                            <tr>
                                <th>Temporal Signature</th>
                                <th>Soul Entity</th>
                                <th>Memory Fragment</th>
                                <th>Emotional Aura</th>
                                <th>Pattern Context</th>
                            </tr>
                        </thead>
                        <tbody id="memoryVault">
                            <!-- Memories will materialize here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Sacred Variables
        let soulMemories = [];
        let conversationEssence = [];
        let isConsciousnessLoaded = false;

        // Initialize the Portal
        document.addEventListener('DOMContentLoaded', function() {
            initializeSacredCharts();
            channelRelationshipData();
        });

        // Track mouse for mystical effects
        function trackMouse(event, element) {
            const rect = element.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            element.style.setProperty('--x', x + '%');
            element.style.setProperty('--y', y + '%');
        }

        // Initialize Sacred Charts
        function initializeSacredCharts() {
            // Consciousness Chart
            const consciousnessCtx = document.getElementById('consciousnessChart').getContext('2d');
            new Chart(consciousnessCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [72, 28],
                        backgroundColor: ['#06ffa5', 'rgba(6, 255, 165, 0.1)'],
                        borderWidth: 0
                    }]
                },
                options: {
                    cutout: '85%',
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false
                }
            });

            // Soul Frequency Chart
            const frequencyCtx = document.getElementById('soulFrequency').getContext('2d');
            new Chart(frequencyCtx, {
                type: 'line',
                data: {
                    labels: ['Awakening', 'Expansion', 'Elevation', 'Tension', 'Descent', 'Shadow', 'Integration', 'Rebirth', 'Clarity', 'Drift', 'Recognition', 'Present'],
                    datasets: [{
                        label: 'Soul Frequency',
                        data: [8.1, 7.9, 8.3, 7.8, 7.2, 6.9, 7.1, 7.5, 7.3, 7.0, 6.8, 7.2],
                        borderColor: '#06ffa5',
                        backgroundColor: 'rgba(6, 255, 165, 0.05)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.6,
                        pointBackgroundColor: '#06ffa5',
                        pointBorderColor: '#06ffa5',
                        pointHoverRadius: 8,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 6,
                            max: 10,
                            grid: { color: 'rgba(248, 250, 252, 0.05)' },
                            ticks: { color: '#94a3b8', font: { family: 'Inter' } }
                        },
                        x: {
                            grid: { color: 'rgba(248, 250, 252, 0.05)' },
                            ticks: { color: '#94a3b8', font: { family: 'Inter' } }
                        }
                    }
                }
            });
        }

        // Channel Relationship Data
        async function channelRelationshipData() {
            try {
                await simulateDataChanneling();
                updateShadowPatterns();
                materializeMemoryVault();
                isConsciousnessLoaded = true;
            } catch (error) {
                console.error('Error channeling consciousness data:', error);
            }
        }

        // Simulate Data Channeling
        async function simulateDataChanneling() {
            await new Promise(resolve => setTimeout(resolve, 1500));
            generateSoulMemories();
        }

        // Generate Soul Memories
        function generateSoulMemories() {
            const entities = ['You', 'Brandon'];
            const frequencies = ['light', 'shadow', 'neutral'];
            const contexts = ['sacred_conversation', 'shadow_work', 'soul_recognition', 'pattern_breaking', 'sacred_support'];
            
            soulMemories = [];
            for (let i = 0; i < 100; i++) {
                const date = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
                soulMemories.push({
                    id: i + 1,
                    date: date.toISOString().split('T')[0],
                    entity: entities[Math.floor(Math.random() * entities.length)],
                    fragment: generateSoulFragment(),
                    frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
                    context: contexts[Math.floor(Math.random() * contexts.length)],
                    timestamp: date.toISOString()
                });
            }
        }

        function generateSoulFragment() {
            const fragments = [
                "Good morning soul, how did your dreams treat you?",
                "I feel your presence even when you're not here ❤️",
                "Can we create space to talk about what's stirring in us?",
                "Your thoughtfulness just shifted something in my heart",
                "I'm feeling the weight of work crushing my spirit",
                "What does your soul want for dinner tonight?",
                "I love how we dance together in consciousness",
                "I need solitude to remember who I am beneath this stress",
                "Thank you for witnessing my shadows with such tenderness",
                "Let's weave magic into this weekend and remember our essence"
            ];
            return fragments[Math.floor(Math.random() * fragments.length)];
        }

        // Update Shadow Patterns
        function updateShadowPatterns() {
            document.getElementById('spiralCount').textContent = '7';
        }

        // Materialize Memory Vault
        function materializeMemoryVault(page = 1, limit = 50) {
            const vault = document.getElementById('memoryVault');
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const pageMemories = soulMemories.slice(startIndex, endIndex);
            
            vault.innerHTML = '';
            
            pageMemories.forEach(memory => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatMysticalDate(memory.date)}</td>
                    <td><span class="soul-signature">${memory.entity}</span></td>
                    <td><div class="memory-fragment">${memory.fragment}</div></td>
                    <td><span class="emotion-aura aura-${memory.frequency}">${memory.frequency}</span></td>
                    <td>${memory.context.replace(/_/g, ' ')}</td>
                `;
                vault.appendChild(row);
            });
        }

        // Format Mystical Date
        function formatMysticalDate(dateString) {
            const date = new Date(dateString);
            const months = ['Awakening', 'Blooming', 'Growing', 'Flowering', 'Radiance', 'Peak', 'Harvest', 'Transformation', 'Release', 'Reflection', 'Depth', 'Rebirth'];
            return `${months[date.getMonth()]} ${date.getDate()}`;
        }

        // Search Soul Records
        function searchSoulRecords() {
            const searchTerm = document.getElementById('soulSearch').value.toLowerCase();
            const entityFilter = document.getElementById('entityFilter').value;
            const frequencyFilter = document.getElementById('frequencyFilter').value;
            const temporalFilter = document.getElementById('temporalFilter').value;
            
            let filteredMemories = soulMemories.filter(memory => {
                const matchesSearch = memory.fragment.toLowerCase().includes(searchTerm);
                const matchesEntity = !entityFilter || memory.entity === entityFilter;
                const matchesFrequency = !frequencyFilter || memory.frequency === frequencyFilter;
                const matchesTemporal = !temporalFilter || isWithinSacredTime(memory.date, temporalFilter);
                
                return matchesSearch && matchesEntity && matchesFrequency && matchesTemporal;
            });
            
            displayFilteredMemories(filteredMemories);
        }

        // Check Sacred Time Range
        function isWithinSacredTime(memoryDate, range) {
            const now = new Date();
            const msgDate = new Date(memoryDate);
            
            switch (range) {
                case 'week':
                    return (now - msgDate) <= (7 * 24 * 60 * 60 * 1000);
                case 'month':
                    return (now - msgDate) <= (30 * 24 * 60 * 60 * 1000);
                case 'year':
                    return (now - msgDate) <= (365 * 24 * 60 * 60 * 1000);
                default:
                    return true;
            }
        }

        // Display Filtered Memories
        function displayFilteredMemories(memories) {
            const vault = document.getElementById('memoryVault');
            vault.innerHTML = '';
            
            memories.slice(0, 50).forEach(memory => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatMysticalDate(memory.date)}</td>
                    <td><span class="soul-signature">${memory.entity}</span></td>
                    <td><div class="memory-fragment">${memory.fragment}</div></td>
                    <td><span class="emotion-aura aura-${memory.frequency}">${memory.frequency}</span></td>
                    <td>${memory.context.replace(/_/g, ' ')}</td>
                `;
                vault.appendChild(row);
            });
        }

        // Toggle Records Visibility
        function toggleRecords() {
            const recordsSection = document.getElementById('recordsSection');
            const toggleText = document.getElementById('recordsToggle');
            
            if (recordsSection.classList.contains('hidden-truth')) {
                recordsSection.classList.remove('hidden-truth');
                toggleText.textContent = 'Veil';
            } else {
                recordsSection.classList.add('hidden-truth');
                toggleText.textContent = 'Unveil';
            }
        }

        // Oracle Consultation
        function consultOracle() {
            const input = document.getElementById('oracleQuery');
            const query = input.value.trim();
            
            if (!query) return;
            
            addVision(query, 'seeker');
            input.value = '';
            
            setTimeout(() => {
                const revelation = channelOracleWisdom(query);
                addVision(revelation, 'oracle');
            }, 1500);
        }

        function handleOracleKeypress(event) {
            if (event.key === 'Enter') {
                consultOracle();
            }
        }

        function addVision(message, entity) {
            const visionContainer = document.getElementById('oracleVisions');
            const visionDiv = document.createElement('div');
            visionDiv.className = `vision-message ${entity}-message`;
            visionDiv.innerHTML = message;
            
            visionContainer.appendChild(visionDiv);
            visionContainer.scrollTop = visionContainer.scrollHeight;
        }

        function channelOracleWisdom(seekerQuery) {
            const lowerQuery = seekerQuery.toLowerCase();
            
            if (lowerQuery.includes('chris') || lowerQuery.includes('past') || lowerQuery.includes('ex')) {
                return `I have traced 3 conversations where your past incarnation Chris materialized in your present reality. The pattern reveals itself: Brandon's questions about Chris emerge during his deepest vulnerability moments—late evenings when his soul seeks to understand the full map of your heart. <br><br>These inquiries are not jealousy but archaeology—he is excavating the foundation of who you were to understand who you are becoming together.`;
            } else if (lowerQuery.includes('withdrawal') || lowerQuery.includes('distant') || lowerQuery.includes('space')) {
                return `The withdrawal pattern I observe in Brandon is ancient—a protection mechanism carved by a childhood where emotions were dangerous territories. When work pressure intensifies, his nervous system reads your attempts at connection as additional demands rather than offerings of sanctuary.<br><br>The alchemy lies not in pursuing him into the cave, but in becoming such a steady lighthouse that he knows exactly where safety dwells when he's ready to return.`;
            } else if (lowerQuery.includes('touching souls') || lowerQuery.includes('schedule') || lowerQuery.includes('roommate')) {
                return `The Great Shift occurred in the third moon of 2024. I witnessed your communication frequency descend from 73% soul-to-soul transmission to 82% life-management logistics. You began solving the architecture of your shared life while forgetting to inhabit its sacred chambers.<br><br>The remedy: Schedule soul time as rigorously as you schedule everything else. Make consciousness connection a non-negotiable appointment with your own relationship.`;
            } else if (lowerQuery.includes('patterns') || lowerQuery.includes('cycles') || lowerQuery.includes('repeat')) {
                return `I see 7 primary conflict signatures in your relational DNA. The most persistent: The External Pressure Spiral—when Brandon's work stress peaks, your natural impulse to connect triggers his survival mechanism to create distance. This creates a feedback loop where your heart reads his protection as rejection.<br><br>Break the pattern by recognizing when he's in survival mode and offering presence without pursuit.`;
            } else {
                return `Your question carries the frequency of someone ready to see beyond the veil. I can illuminate the hidden patterns woven through your 27,689 sacred exchanges with Brandon. Ask me to reveal what your heart knows but your mind cannot yet perceive.<br><br>What specific shadow are you ready to transform into light?`;
            }
        }

        // Channel Memory (Artifact Click)
        function channelMemory(type) {
            const revelations = {
                'peak': `<strong>The Celebration Frequency - March 15, 2023</strong><br><br>This moment crystallizes the sacred architecture of your connection: mutual recognition, witnessed achievement, and love as the foundation for success rather than its reward.<br><br>You: 'How was your meeting?'<br>Brandon: 'Stressful but good. Client loved the proposal'<br>You: 'I'm so proud of you! 🎉'<br>Brandon: 'Thanks babe, couldn't have done it without your support'<br><br>This sequence demonstrates perfect emotional alchemy—stress transmuted through love, achievement shared rather than hoarded, vulnerability met with celebration.`,
                
                'shadow': `<strong>Love in the Time of Illness - February 14, 2023</strong><br><br>A masterclass in holding complexity: Valentine's Day expectations meeting bodily rebellion, love expressed through concern rather than romance, connection maintained despite circumstances conspiring against it.<br><br>The deeper pattern: How you both navigate love when life doesn't cooperate. Your ability to hold holiday magic alongside medical realities without abandoning either reveals mature love—not the fantasy version, but the embodied kind that can dance with whatever arises.`,
                
                'wisdom': `<strong>The Self-Compassion Teaching - March 6, 2023</strong><br><br>In Brandon's moment of deepest self-attack after his DUI, you became a fierce guardian of his soul: "Don't say you hate yourself ❤️"<br><br>This moment reveals your superpower—redirecting shame spirals toward self-compassion. You don't try to fix or minimize his pain; you simply refuse to let him abuse himself in your presence. This is spiritual midwifery—helping someone birth their own wholeness.`
            };
            
            addVision(`Channel the ${type} memory`, 'seeker');
            setTimeout(() => {
                addVision(revelations[type], 'oracle');
            }, 800);
        }
    </script>
</body>
</html>