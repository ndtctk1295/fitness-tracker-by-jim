'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { 
  FolderPlus, 
  Pencil, 
  Trash2,
  Palette,
  Loader2
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Category } from '@/lib/types';
import axios from 'axios';

interface CategoryFormData {
  name: string;
  color: string;
}

export function CategoryManagement() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    color: '#ef4444', // Default red color
  });
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const predefinedColors = [
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#64748b', // Slate
    '#000000', // Black
  ];

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreateDialog = () => {
    setCurrentCategory(null);
    setFormData({
      name: '',
      color: predefinedColors[0],
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
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
      if (!formData.name || !formData.color) {
        toast({
          title: 'Validation Error',
          description: 'Name and color are required',
          variant: 'destructive',
        });
        return;
      }

      if (currentCategory) {
        // Update existing category
        await axios.put(`/api/categories/${currentCategory._id}`, formData);
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        // Create new category
        await axios.post('/api/categories', formData);
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
      }

      setIsDialogOpen(false);
      loadCategories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (categoryId: string) => {
    setDeletingCategoryId(categoryId);
    setIsDeleteDialogOpen(true);
  };
  const handleDelete = async () => {
    if (!deletingCategoryId) return;

    try {
      setSubmitting(true);
      await axios.delete(`/api/categories/${deletingCategoryId}`);
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      loadCategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category. It may be in use by exercises.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <Button onClick={handleOpenCreateDialog}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading categories...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Color</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No categories found</TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge className="px-2 py-1" style={{ backgroundColor: category.color }}>
                        {category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteDialog(category._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {currentCategory
                ? 'Update category details'
                : 'Fill in the details to create a new category'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-16 h-10 p-1"
                />
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Palette className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Predefined Colors</Label>
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-black dark:border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <Label>Preview</Label>
              <div className="flex items-center space-x-2 mt-2">
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: formData.color }} 
                />
                <Badge 
                  className="px-2 py-1" 
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.name || 'Category Name'}
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter>            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentCategory ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{currentCategory ? 'Update Category' : 'Create Category'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              Note: Categories used by exercises cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
