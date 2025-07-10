'use client';

import { useState } from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ApiTester } from '@/components/api-tester';
import { ExerciseTemplateList } from '@/components/exercise-template-list';

export default function TestPage() {
  const [selectedDate] = useState<Date>(new Date());

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">API Integration Testing</h1>
      <p className="text-muted-foreground">
        Use this page to test the scheduled exercises API integration
      </p>

      <Tabs defaultValue="tester">
        <TabsList>
          <TabsTrigger value="tester">API Tester</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="tester" className="mt-4">
          <ApiTester />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Templates Demo</CardTitle>
              <CardDescription>
                Test exercise templates functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="md:w-2/3 mx-auto">
                <ExerciseTemplateList 
                  selectedDate={selectedDate}
                  onTemplateApplied={() => {
                    // Could refresh data here in a real implementation
                    console.log('Templates applied!');
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
