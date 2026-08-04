'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  useCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
} from '@/services'
import { useToast } from '@/hooks'
import { Button, Input, PopupModal, DataTable, type Column } from '@/components/ui'
import type { CategoryPayloadType, CategoryType } from '@/types'

type CategoryFormValues = {
  name: string
  slug: string
}

const schema: yup.ObjectSchema<CategoryFormValues> = yup.object({
  name: yup.string().required('Name is required'),
  slug: yup.string().required('Slug is required'),
})

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|$)/g, '')
}

const columns: Column[] = [
  { key: 'name', title: 'Name' },
  { key: 'slug', title: 'Slug' },
  { key: 'actions', title: '', className: 'text-right' },
]

export default function AdminCategoriesView() {
  const { categories, loading, refresh } = useCategories()
  const { showSuccess, showError } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryType | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({ resolver: yupResolver(schema) })

  const nameValue = watch('name')

  useEffect(() => {
    if (!editing) setValue('slug', slugify(nameValue || ''))
  }, [nameValue, editing, setValue])

  const openCreateModal = () => {
    setEditing(null)
    setImageFile(null)
    reset({ name: '', slug: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (category: CategoryType) => {
    setEditing(category)
    setImageFile(null)
    reset({ name: category.name, slug: category.slug })
    setIsModalOpen(true)
  }

  const onSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true)
    try {
      let image_url = editing?.image_url ?? null
      if (imageFile) {
        image_url = await uploadCategoryImage(imageFile)
      }

      const payload: CategoryPayloadType = { ...values, image_url }

      if (editing) {
        await updateCategory(editing.id, payload)
        showSuccess('Category updated')
      } else {
        await createCategory(payload)
        showSuccess('Category created')
      }
      setIsModalOpen(false)
      refresh()
    } catch (error) {
      showError('Save failed', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (category: CategoryType) => {
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) return
    try {
      await deleteCategory(category.id)
      showSuccess('Category deleted')
      refresh()
    } catch (error) {
      showError('Delete failed', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">Categories</h1>
          <p className="mt-1 text-sm text-text-muted">Organize movies and events.</p>
        </div>
        <Button onClick={openCreateModal} startContent={<PlusIcon className="size-4" />}>
          Add Category
        </Button>
      </div>

      <div className="mt-6">
        <DataTable<CategoryType>
          columns={columns}
          data={categories}
          loading={loading}
          rowKey={c => c.id}
          emptyMessage="No categories yet."
          renderRow={category => (
            <>
              <td className="px-6 py-4 text-sm font-semibold text-off-white">{category.name}</td>
              <td className="px-6 py-4 text-sm text-text-grey">{category.slug}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(category)}
                    className="rounded-lg p-2 text-text-grey hover:bg-white/10 hover:text-off-white"
                    aria-label="Edit"
                  >
                    <PencilSquareIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    className="rounded-lg p-2 text-text-grey hover:bg-danger/10 hover:text-danger"
                    aria-label="Delete"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              </td>
            </>
          )}
        />
      </div>

      <PopupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" fullWidth {...register('name')} error={errors.name?.message} />
          <Input label="Slug" fullWidth {...register('slug')} error={errors.slug?.message} />

          <div className="form-group">
            <label className="form-label" htmlFor="category-image">
              Image (optional)
            </label>
            <input
              id="category-image"
              type="file"
              accept="image/*"
              onChange={e => setImageFile(e.target.files?.[0] ?? null)}
              className="form-control"
            />
            {editing?.image_url && !imageFile && (
              <p className="mt-1 text-xs text-text-muted">
                Current image will be kept unless you choose a new one.
              </p>
            )}
          </div>
          <Button type="submit" loading={submitting} fullWidth className="mt-2">
            {editing ? 'Save Changes' : 'Create Category'}
          </Button>
        </form>
      </PopupModal>
    </div>
  )
}
