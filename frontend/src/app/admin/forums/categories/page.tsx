'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderTree,
  Lock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  getAdminForumCategories,
  createForumCategory,
  updateForumCategory,
  deleteForumCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput
} from '@/actions/admin/forums';
import type { ForumCategory } from '@/types/database';
import { DataTable } from '@/components/admin/DataTable';
import { slugify } from '@/lib/utils';

export default function AdminForumsCategoriesPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateCategoryInput>({
    slug: '',
    name: '',
    description: '',
    icon: '',
    color: '#3b82f6',
    sort_order: 0,
    is_active: true,
    requires_auth: false,
  });

  const router = useRouter();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await getAdminForumCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createForumCategory(formData);
      if (result.success) {
        setShowCreateModal(false);
        resetForm();
        await fetchCategories();
      } else {
        alert(result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const updateData: UpdateCategoryInput = {
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
      requires_auth: formData.requires_auth,
    };

    try {
      const result = await updateForumCategory(editingCategory.id, updateData);
      if (result.success) {
        setEditingCategory(null);
        resetForm();
        await fetchCategories();
      } else {
        alert(result.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleDelete = async (category: ForumCategory) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(category.id);
    try {
      const result = await deleteForumCategory(category.id);
      if (result.success) {
        await fetchCategories();
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      name: '',
      description: '',
      icon: '',
      color: '#3b82f6',
      sort_order: 0,
      is_active: true,
      requires_auth: false,
    });
  };

  const startEdit = (category: ForumCategory) => {
    setEditingCategory(category);
    setFormData({
      slug: category.slug, // Not editable
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#3b82f6',
      sort_order: category.sort_order,
      is_active: category.is_active,
      requires_auth: category.requires_auth,
    });
  };

  const columns = [
    {
      key: 'name',
      header: 'Category',
      render: (category: ForumCategory) => (
        <div className="flex items-center gap-3">
          {category.icon && (
            <span className="text-2xl">{category.icon}</span>
          )}
          <div>
            <p className="font-medium text-cream-100">{category.name}</p>
            {category.description && (
              <p className="text-xs text-cream-400 mt-1">{category.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (category: ForumCategory) => (
        <span className="text-sm text-cream-300 font-mono">{category.slug}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (category: ForumCategory) => (
        <div className="space-y-1">
          <Badge variant={category.is_active ? 'success' : 'default'}>
            {category.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {category.requires_auth && (
            <Badge variant="default" className="ml-1 text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Members Only
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'sort_order',
      header: 'Order',
      render: (category: ForumCategory) => (
        <span className="text-sm text-cream-300">{category.sort_order}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (category: ForumCategory) => (
        <span className="text-sm text-cream-300">{formatDate(category.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (category: ForumCategory) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => startEdit(category)}
            className="p-2 text-cream-400 hover:text-blue-400 hover:bg-olive-600 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(category)}
            disabled={deleting === category.id}
            className="p-2 text-cream-400 hover:text-red-400 hover:bg-olive-600 rounded transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl text-cream-100 mb-2">Forum Categories</h1>
          <p className="text-cream-400">Manage forum categories and organization</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setEditingCategory(null);
            setShowCreateModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          New Category
        </Button>
      </div>

      {/* Categories Table */}
      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories found. Create your first category!"
        keyExtractor={(category) => category.id}
      />

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCategory) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-olive-800 border-olive-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-cream-100">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingCategory ? handleUpdate : handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">
                      Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData({
                          ...formData,
                          name,
                          slug: !editingCategory ? slugify(name) : formData.slug,
                        });
                      }}
                      required
                      placeholder="Build Planning"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">
                      Slug *
                    </label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                      required
                      disabled={!!editingCategory}
                      placeholder="build-planning"
                    />
                    <p className="text-xs text-cream-400 mt-1">
                      {editingCategory ? 'Slug cannot be changed' : 'Auto-generated from name'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 text-sm"
                    rows={2}
                    placeholder="Get help planning your go-kart build"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">
                      Icon (Emoji or Unicode)
                    </label>
                    <Input
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="🔧"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">
                      Color (Hex)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-olive-600 bg-olive-700 text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="is_active" className="text-sm text-cream-200">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      id="requires_auth"
                      checked={formData.requires_auth}
                      onChange={(e) => setFormData({ ...formData, requires_auth: e.target.checked })}
                      className="w-4 h-4 rounded border-olive-600 bg-olive-700 text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="requires_auth" className="text-sm text-cream-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Requires Auth
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-olive-600">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingCategory(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
