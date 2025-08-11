"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

// Your existing TailAdmin components
import ComponentCard from "@/components/common/ComponentCard";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/Badge";

// New shadcn/ui components
import { Button as ShadcnButton } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Icons from both systems
import { Send, Sparkles, Heart } from "lucide-react";

export default function ShadcnDemoPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="shadcn/ui Demo" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Your Existing TailAdmin Components */}
        <div className="space-y-6">
          <ComponentCard 
            title="🏗️ Your Existing TailAdmin Components"
            desc="These continue working exactly as before"
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">TailAdmin Buttons</h4>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">
                    <Sparkles className="w-4 h-4" />
                    Primary
                  </Button>
                  <Button variant="outline" size="sm">
                    <Sparkles className="w-4 h-4" />
                    Outline
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">TailAdmin Badges</h4>
                <div className="flex gap-2">
                  <Badge variant="light" color="success" size="sm">Success</Badge>
                  <Badge variant="light" color="primary" size="sm">Primary</Badge>
                  <Badge variant="light" color="error" size="sm">Error</Badge>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">TailAdmin Input</h4>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Your existing input styling"
                />
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Right Column - New shadcn/ui Components */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                ✨ New shadcn/ui Components
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">shadcn Buttons</h4>
                <div className="flex gap-2">
                  <ShadcnButton size="sm">
                    <Send className="w-4 h-4" />
                    Default
                  </ShadcnButton>
                  <ShadcnButton variant="outline" size="sm">
                    <Heart className="w-4 h-4" />
                    Outline
                  </ShadcnButton>
                  <ShadcnButton variant="secondary" size="sm">
                    Secondary
                  </ShadcnButton>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">shadcn Badges</h4>
                <div className="flex gap-2">
                  <ShadcnBadge variant="default">Default</ShadcnBadge>
                  <ShadcnBadge variant="secondary">Secondary</ShadcnBadge>
                  <ShadcnBadge variant="destructive">Destructive</ShadcnBadge>
                  <ShadcnBadge variant="outline">Outline</ShadcnBadge>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">shadcn Input</h4>
                <ShadcnInput 
                  placeholder="Beautiful shadcn input with focus states"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">shadcn Dialog</h4>
                <Dialog>
                  <DialogTrigger asChild>
                    <ShadcnButton variant="outline">Open Dialog</ShadcnButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Amazing Dialog with Accessibility</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This dialog has built-in accessibility, focus management, and animations!
                      </p>
                      <ShadcnInput placeholder="Try typing here..." />
                      <div className="flex justify-end gap-2">
                        <ShadcnButton variant="outline">Cancel</ShadcnButton>
                        <ShadcnButton>Save Changes</ShadcnButton>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mixed Usage Example */}
      <ComponentCard
        title="🔄 Mixed Usage Example"
        desc="Using both systems together seamlessly"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You can use your existing ComponentCard (TailAdmin) with shadcn components inside:
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* TailAdmin wrapper with shadcn content */}
            <div className="flex-1">
              <ShadcnInput 
                placeholder="Message to analyze..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <ShadcnButton>
              <Send className="w-4 h-4" />
              Analyze
            </ShadcnButton>
          </div>
          
          {message && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <p className="text-sm">
                  <ShadcnBadge variant="secondary" className="mr-2">
                    Response
                  </ShadcnBadge>
                  You typed: &quot;{message}&quot;
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ComponentCard>

      {/* Migration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Migration Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <ShadcnBadge variant="outline">✅ Keep</ShadcnBadge>
              <div>
                <p className="font-medium">Your existing components work perfectly</p>
                <p className="text-gray-600 dark:text-gray-400">ComponentCard, PageBreadcrumb, TailAdmin layouts</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <ShadcnBadge variant="secondary">🆕 Add</ShadcnBadge>
              <div>
                <p className="font-medium">Use shadcn for new features</p>
                <p className="text-gray-600 dark:text-gray-400">Forms, dialogs, complex interactions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <ShadcnBadge variant="default">🔄 Migrate</ShadcnBadge>
              <div>
                <p className="font-medium">Replace components gradually</p>
                <p className="text-gray-600 dark:text-gray-400">Start with buttons and inputs, move to complex components later</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}