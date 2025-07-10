'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  Plus,
  Pencil,
  Trash,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { weightPlateService } from '@/lib/services/weight-plate-service';

// Types for the admin component
interface AdminWeightPlate {
  _id: string;
  userId: string;
  userName?: string; // Added for displaying user name
  value: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export function WeightManagement() {
  const [weights, setWeights] = useState<AdminWeightPlate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<AdminWeightPlate | null>(null);
  const [formData, setFormData] = useState({
    value: '',
    color: '#3b82f6',
    userId: '',
  });
  const [deletingWeightId, setDeletingWeightId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userFilter, setUserFilter] = useState('');

  const loadWeights = async () => {
    try {
      setLoading(true);
      // For admin, we'll need a different API endpoint that gets all weights
      const response = await fetch('/api/admin/weights');
      if (!response.ok) {
        throw new Error('Failed to fetch weights');
      }
      const data = await response.json();
      setWeights(data);
    } catch (error) {
      toast.error('Failed to load weights');
      console.error('Error loading weights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeights();
  }, []);

  const handleOpenCreateDialog = () => {
    setCurrentWeight(null);
    setFormData({
      value: '',
      color: '#3b82f6',
      userId: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (weight: AdminWeightPlate) => {
    setCurrentWeight(weight);
    setFormData({
      value: weight.value.toString(),
      color: weight.color,
      userId: weight.userId,
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (!formData.value || !formData.color || !formData.userId) {
        toast.error('Value, color, and user ID are required');
        return;
      }

      const weightData = {
        value: parseFloat(formData.value),
        color: formData.color,
      };

      if (currentWeight) {
        // Update existing weight plate
        await weightPlateService.update(currentWeight._id, weightData);
        toast.success('Weight plate updated successfully');
      } else {
        // Create new weight plate (for a specific user)
        // For admin, we'll need a different API endpoint or parameter
        await fetch('/api/admin/weights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...weightData,
            userId: formData.userId,
          }),
        });
        toast.success('Weight plate created successfully');
      }

      setIsDialogOpen(false);
      loadWeights();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (weightId: string) => {
    setDeletingWeightId(weightId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingWeightId) return;

    try {
      setSubmitting(true);
      // For admin, we'll need a dedicated endpoint
      await fetch(`/api/admin/weights/${deletingWeightId}`, {
        method: 'DELETE',
      });
      
      toast.success('Weight plate deleted successfully');
      setIsDeleteDialogOpen(false);
      loadWeights();
    } catch (error) {
      toast.error('Failed to delete weight plate');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWeights = weights.filter(weight => {
    if (!userFilter) return true;
    return weight.userId.includes(userFilter) || 
           (weight.userName && weight.userName.toLowerCase().includes(userFilter.toLowerCase()));
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Weight Plates Management</h2>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Weight Plate
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Label htmlFor="user-filter" className="w-20">Filter</Label>
        <Input
          id="user-filter"
          placeholder="Filter by user ID or name"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading weight plates...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Weight Value</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWeights.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No weight plates found</TableCell>
                </TableRow>
              ) : (
                filteredWeights.map((weight) => (
                  <TableRow key={weight._id}>
                    <TableCell>
                      <div
                        className="w-8 h-16 rounded-sm flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: weight.color }}
                      >
                        {weight.value}
                      </div>
                    </TableCell>
                    <TableCell>{weight.value}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: weight.color }}
                        ></div>
                        {weight.color}
                      </div>
                    </TableCell>
                    <TableCell>{weight.userName || weight.userId}</TableCell>
                    <TableCell>{new Date(weight.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(weight.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditDialog(weight)}
                        disabled={submitting}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleOpenDeleteDialog(weight._id)}
                        disabled={submitting}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Weight Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentWeight ? 'Edit Weight Plate' : 'Create New Weight Plate'}
            </DialogTitle>
            <DialogDescription>
              {currentWeight
                ? 'Update weight plate details.'
                : 'Fill in the details to create a new weight plate.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                disabled={currentWeight !== null || submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Weight Value</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.25"
                value={formData.value}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-16 p-1 h-10"
                  disabled={submitting}
                />
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="flex-1"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {currentWeight ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the weight plate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
