'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  useCategories,
  useEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventPoster,
} from '@/services'
import { useToast } from '@/hooks'
import {
  Button,
  Input,
  TextArea,
  Select,
  CheckBox,
  PopupModal,
  DataTable,
  type Column,
} from '@/components/ui'
import type { EventPayloadType, EventType } from '@/types'

type MovieFormValues = {
  title: string
  synopsis?: string
  duration_minutes?: number | null
  rating?: string
  trailer_url?: string
  category_id?: string
  is_published: boolean
}

const schema: yup.ObjectSchema<MovieFormValues> = yup.object({
  title: yup.string().required('Title is required'),
  synopsis: yup.string(),
  duration_minutes: yup
    .number()
    .nullable()
    .transform((v, o) => (o === '' || o === undefined ? null : v))
    .typeError('Enter a valid duration'),
  rating: yup.string(),
  trailer_url: yup.string(),
  category_id: yup.string(),
  is_published: yup.boolean().required(),
})

const columns: Column[] = [
  { key: 'title', title: 'Movie' },
  { key: 'category', title: 'Category' },
  { key: 'duration', title: 'Duration' },
  { key: 'status', title: 'Status' },
  { key: 'actions', title: '', className: 'text-right' },
]

export default function AdminMoviesView() {
  const { categories } = useCategories()
  const { events: movies, loading, refresh } = useEvents({ kind: 'movie' })
  const { showSuccess, showError } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<EventType | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MovieFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { is_published: true },
  })

  const openCreateModal = () => {
    setEditing(null)
    setPosterFile(null)
    reset({
      title: '',
      synopsis: '',
      duration_minutes: undefined,
      rating: '',
      trailer_url: '',
      category_id: '',
      is_published: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (movie: EventType) => {
    setEditing(movie)
    setPosterFile(null)
    reset({
      title: movie.title,
      synopsis: movie.synopsis ?? '',
      duration_minutes: movie.duration_minutes,
      rating: movie.rating ?? '',
      trailer_url: movie.trailer_url ?? '',
      category_id: movie.category_id ?? '',
      is_published: movie.is_published,
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (values: MovieFormValues) => {
    setSubmitting(true)
    try {
      let poster_url = editing?.poster_url ?? null
      if (posterFile) {
        poster_url = await uploadEventPoster(posterFile)
      }

      const payload: EventPayloadType = {
        kind: 'movie',
        title: values.title,
        synopsis: values.synopsis || null,
        duration_minutes: values.duration_minutes ?? null,
        rating: values.rating || null,
        trailer_url: values.trailer_url || null,
        category_id: values.category_id || null,
        is_published: values.is_published,
        poster_url,
      }

      if (editing) {
        await updateEvent(editing.id, payload)
        showSuccess('Movie updated')
      } else {
        await createEvent(payload)
        showSuccess('Movie created')
      }
      setIsModalOpen(false)
      refresh()
    } catch (error) {
      showError('Save failed', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (movie: EventType) => {
    if (!window.confirm(`Delete "${movie.title}"? This cannot be undone.`)) return
    try {
      await deleteEvent(movie.id)
      showSuccess('Movie deleted')
      refresh()
    } catch (error) {
      showError('Delete failed', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">Movies</h1>
          <p className="mt-1 text-sm text-text-muted">Manage film listings and posters.</p>
        </div>
        <Button onClick={openCreateModal} startContent={<PlusIcon className="size-4" />}>
          Add Movie
        </Button>
      </div>

      <div className="mt-6">
        <DataTable<EventType>
          columns={columns}
          data={movies}
          loading={loading}
          rowKey={m => m.id}
          emptyMessage="No movies yet."
          renderRow={movie => (
            <>
              <td className="px-6 py-4 text-sm font-semibold text-off-white">{movie.title}</td>
              <td className="px-6 py-4 text-sm text-text-grey">
                {movie.categories?.name ?? '—'}
              </td>
              <td className="px-6 py-4 text-sm text-text-muted">
                {movie.duration_minutes ? `${movie.duration_minutes} min` : '—'}
              </td>
              <td className="px-6 py-4">
                <span
                  className={
                    movie.is_published
                      ? 'rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success'
                      : 'rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-text-grey'
                  }
                >
                  {movie.is_published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(movie)}
                    className="rounded-lg p-2 text-text-grey hover:bg-white/10 hover:text-off-white"
                    aria-label="Edit"
                  >
                    <PencilSquareIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(movie)}
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
        title={editing ? 'Edit Movie' : 'Add Movie'}
        size="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Title" fullWidth {...register('title')} error={errors.title?.message} />
          <TextArea
            label="Synopsis"
            {...register('synopsis')}
            error={errors.synopsis?.message}
          />
          <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              fullWidth
              {...register('duration_minutes')}
              error={errors.duration_minutes?.message}
            />
            <Input label="Rating" fullWidth {...register('rating')} error={errors.rating?.message} />
          </div>
          <Input
            label="Trailer URL"
            fullWidth
            {...register('trailer_url')}
            error={errors.trailer_url?.message}
          />
          <Select
            label="Category"
            fullWidth
            {...register('category_id')}
            error={errors.category_id?.message}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <div className="form-group">
            <label className="form-label" htmlFor="movie-poster">
              Poster
            </label>
            <input
              id="movie-poster"
              type="file"
              accept="image/*"
              onChange={e => setPosterFile(e.target.files?.[0] ?? null)}
              className="form-control"
            />
          </div>

          <CheckBox label="Published" {...register('is_published')} />

          <Button type="submit" loading={submitting} fullWidth className="mt-2">
            {editing ? 'Save Changes' : 'Create Movie'}
          </Button>
        </form>
      </PopupModal>
    </div>
  )
}
