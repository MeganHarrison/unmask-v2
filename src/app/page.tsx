import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, BarChart3, Brain, Heart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to <span className="text-purple-600">Unmask</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Transform your text messages into actionable relationship insights
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/messages">
            <Button size="lg">
              <MessageSquare className="mr-2 h-5 w-5" />
              Browse Messages
            </Button>
          </Link>
          <Link href="/insights">
            <Button size="lg" variant="outline">
              <BarChart3 className="mr-2 h-5 w-5" />
              View Insights
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
        <Card>
          <CardHeader>
            <MessageSquare className="h-10 w-10 text-purple-600 mb-2" />
            <CardTitle>Message Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Browse through 27,689 text messages with advanced filtering and search capabilities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Brain className="h-10 w-10 text-purple-600 mb-2" />
            <CardTitle>AI-Powered Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Leverage Claude AI to analyze sentiment, detect conflicts, and understand emotional patterns.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChart3 className="h-10 w-10 text-purple-600 mb-2" />
            <CardTitle>Relationship Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Visualize communication patterns, message frequency, and relationship health over time.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="mt-12">
        <CardHeader className="text-center">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <CardTitle className="text-2xl">Your Relationship at a Glance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-purple-600">27.7K</p>
              <p className="text-sm text-gray-600">Total Messages</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">2.5</p>
              <p className="text-sm text-gray-600">Years of Data</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">2</p>
              <p className="text-sm text-gray-600">Participants</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">AI</p>
              <p className="text-sm text-gray-600">Ready to Analyze</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}