'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Check, X, Loader2, Download } from 'lucide-react';
import { ImportData, CategoryImportData, ExerciseImportData } from '@/lib/types';

interface ImportResult {
  success: boolean;
  message?: string;
  details?: {
    categoriesCreated: number;
    exercisesCreated: number;
    errors: string[];
  };
  error?: string;
}

export function ImportManagement() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; errors?: string[] } | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportData(null);
      setValidationResult(null);
      setImportResult(null);
      parseFile(file);
    }
  };

  const parseFile = async (file: File) => {
    setIsValidating(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setImportData(data);
      
      // Client-side validation preview
      if (data.categories && data.exercises) {
        setValidationResult({ 
          success: true 
        });
      } else {
        setValidationResult({ 
          success: false, 
          errors: ['JSON must contain "categories" and "exercises" arrays'] 
        });
      }
    } catch (error) {
      setValidationResult({ 
        success: false, 
        errors: ['Invalid JSON file format'] 
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importData),
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult({
          success: true,
          message: result.message,
          details: result.details
        });
        // Reset form on success
        setSelectedFile(null);
        setImportData(null);
        setValidationResult(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setImportResult({
          success: false,
          error: result.error,
          details: result.details
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: 'Network error occurred during import'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const generateTemplate = () => {
    const template: ImportData = {
      categories: [
        {
          name: "Strength Training",
          color: "#ef4444",
          description: "Exercises focused on building muscle strength"
        },
        {
          name: "Cardio",
          color: "#3b82f6",
          description: "Cardiovascular exercises for heart health"
        }
      ],
      exercises: [
        {
          name: "Push-ups",
          categoryName: "Strength Training",
          description: "Classic bodyweight exercise for upper body strength",
          difficulty: "beginner",
          muscleGroups: ["chest", "shoulders", "triceps"],
          equipment: [],
          instructions: [
            "Start in a plank position with hands slightly wider than shoulders",
            "Lower your body until your chest nearly touches the floor",
            "Push back up to the starting position",
            "Keep your body in a straight line throughout the movement"
          ],
          tips: [
            "Keep your core engaged throughout the movement",
            "Don't let your hips sag or pike up"
          ],
          isActive: true
        },
        {
          name: "Running",
          categoryName: "Cardio",
          description: "Basic running exercise for cardiovascular fitness",
          difficulty: "beginner",
          muscleGroups: ["legs", "glutes", "core"],
          equipment: ["running shoes"],
          instructions: [
            "Start with a light warm-up walk",
            "Gradually increase your pace to a comfortable run",
            "Maintain steady breathing throughout",
            "Cool down with a slow walk"
          ],
          tips: [
            "Start with shorter distances and gradually increase",
            "Focus on consistent pace rather than speed"
          ],
          isActive: true
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Template Download
          </CardTitle>
          <CardDescription>
            Download a template JSON file to see the required format for imports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateTemplate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Upload a JSON file containing categories and exercises to import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-file">Select JSON File</Label>
            <Input
              ref={fileInputRef}
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
            />
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{selectedFile.name}</span>
              {isValidating && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          )}

          {validationResult && (
            <Alert variant={validationResult.success ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {validationResult.success ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <AlertDescription>
                  {validationResult.success ? (
                    "File format is valid"
                  ) : (
                    <div>
                      <p>Validation failed:</p>
                      <ul className="list-disc list-inside mt-1">
                        {validationResult.errors?.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {importData && validationResult?.success && (
            <div className="space-y-2">
              <h4 className="font-medium">Import Preview:</h4>
              <div className="text-sm text-muted-foreground grid grid-cols-2 gap-4">
                <div>
                  <strong>Categories to import:</strong> {importData.categories.length}
                  <ul className="list-disc list-inside mt-1">
                    {importData.categories.map((cat, index) => (
                      <li key={index}>{cat.name}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Exercises to import:</strong> {importData.exercises.length}
                  <ul className="list-disc list-inside mt-1">
                    {importData.exercises.slice(0, 5).map((ex, index) => (
                      <li key={index}>{ex.name}</li>
                    ))}
                    {importData.exercises.length > 5 && (
                      <li>... and {importData.exercises.length - 5} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!validationResult?.success || isImporting}
              className="flex items-center gap-2"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.success ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {importResult.success ? (
              <div className="space-y-2">
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    {importResult.message}
                  </AlertDescription>
                </Alert>
                {importResult.details && (
                  <div className="text-sm space-y-1">
                    <p>✅ Categories created: {importResult.details.categoriesCreated}</p>
                    <p>✅ Exercises created: {importResult.details.exercisesCreated}</p>
                    {importResult.details.errors.length > 0 && (
                      <div>
                        <p className="text-amber-600">⚠️ Warnings:</p>
                        <ul className="list-disc list-inside ml-4">
                          {importResult.details.errors.map((error, index) => (
                            <li key={index} className="text-amber-600">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <p>{importResult.error}</p>
                    {importResult.details?.errors && (
                      <ul className="list-disc list-inside mt-2">
                        {importResult.details.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
