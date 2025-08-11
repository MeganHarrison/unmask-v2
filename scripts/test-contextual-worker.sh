#!/bin/bash

# Test script for the Enhanced Relationship Intelligence Worker

WORKER_URL="https://enhanced-relationship-intelligence-worker.megan-d14.workers.dev"

echo "🧪 Testing Enhanced Relationship Intelligence Worker..."
echo ""

# Test 1: Create daily context
echo "1️⃣ Creating daily context for today..."
curl -X POST "$WORKER_URL/api/daily-context" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "'$(date +%Y-%m-%d)'",
    "physical_status": "together",
    "relationship_satisfaction": 9,
    "personal_energy": 8,
    "external_stressors": "Work deadline",
    "connection_quality": "Strong emotional connection despite work stress",
    "notes": "Great day together, worked through challenges as a team"
  }'
echo -e "\n\n"

# Test 2: Get daily context
echo "2️⃣ Retrieving daily context..."
curl -X GET "$WORKER_URL/api/daily-context?date=$(date +%Y-%m-%d)"
echo -e "\n\n"

# Test 3: Log a relationship event
echo "3️⃣ Logging a relationship event..."
curl -X POST "$WORKER_URL/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "'$(date +%Y-%m-%d)'",
    "event_type": "breakthrough",
    "title": "Deep conversation about future plans",
    "description": "Had an amazing conversation about our dreams and goals",
    "impact_score": 9
  }'
echo -e "\n\n"

# Test 4: Try the dashboard endpoint
echo "4️⃣ Getting dashboard data..."
curl -X GET "$WORKER_URL/api/dashboard?days=7"
echo -e "\n\n"

echo "✅ Tests complete!"