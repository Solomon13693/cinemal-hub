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
import { EVENT_SUBTYPE_LABEL } from '@/constants'
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
import type { EventPayloadType, EventSubtypeType, EventType } from '@/types'

type EventFormValues = {
  title: string
  synopsis?: string
  organizer?: string
  event_subtype?: EventSubtypeType | ''
  venue_label?: string
  category_id?: string
  is_published: boolean
}

const schema: yup.ObjectSchema<EventFormValues> = yup.object({
  title: yup.string().required('Title is required'),
  synopsis: yup.string(),
  organizer: yup.string(),
  event_subtype: yup
    .mixed<EventSubtypeType | ''>()
    .oneOf(['', 'concert', 'theatre', 'comedy', 'sports', 'other']),
  venue_label: yup.string(),
  category_id: yup.string(),
  is_published: yup.boolean().required(),
})

const columns: Column[] = [
  { key: 'title', title: 'Event' },
  { key: 'subtype', title: 'Type' },
  { key: 'organizer', title: 'Organizer' },
  { key: 'status', title: 'Status' },
  { key: 'actions', title: '', className: 'text-right' },
]

const SUBTYPES = Object.keys(EVENT_SUBTYPE_LABEL) as EventSubtypeType[]

export default function AdminEventsView() {
  const { categories } = useCategories()
  const { events, loading, refresh } = useEvents({ kind: 'event' })
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
  } = useForm<EventFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { is_published: true, event_subtype: '' },
  })

  const openCreateModal = () => {
    setEditing(null)
    setPosterFile(null)
    reset({
      title: '',
      synopsis: '',
      organizer: '',
      event_subtype: '',
      venue_label: '',
      category_id: '',
      is_published: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (event: EventType) => {
    setEditing(event)
    setPosterFile(null)
    reset({
      title: event.title,
      synopsis: event.synopsis ?? '',
      organizer: event.organizer ?? '',
      event_subtype: event.event_subtype ?? '',
      venue_label: event.venue_label ?? '',
      category_id: event.category_id ?? '',
      is_published: event.is_published,
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (values: EventFormValues) => {
    setSubmitting(true)
    try {
      let poster_url = editing?.poster_url ?? null
      if (posterFile) {
        poster_url = await uploadEventPoster(posterFile)
      }

      const payload: EventPayloadType = {
        kind: 'event',
        title: values.title,
        synopsis: values.synopsis || null,
        organizer: values.organizer || null,
        event_subtype: values.event_subtype || null,
        venue_label: values.venue_label || null,
        category_id: values.category_id || null,
        is_published: values.is_published,
        poster_url,
      }

      if (editing) {
        await updateEvent(editing.id, payload)
        showSuccess('Event updated')
      } else {
        await createEvent(payload)
        showSuccess('Event created')
      }
      setIsModalOpen(false)
      refresh()
    } catch (error) {
      showError('Save failed', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (event: EventType) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return
    try {
      await deleteEvent(event.id)
      showSuccess('Event deleted')
      refresh()
    } catch (error) {
      showError('Delete failed', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">Events</h1>
          <p className="mt-1 text-sm text-text-muted">Manage live events and shows.</p>
        </div>
        <Button onClick={openCreateModal} startContent={<PlusIcon className="size-4" />}>
          Add Event
        </Button>
      </div>

      <div className="mt-6">
        <DataTable<EventType>
          columns={columns}
          data={events}
          loading={loading}
          rowKey={e => e.id}
          emptyMessage="No events yet."
          renderRow={event => (
            <>
              <td className="px-6 py-4 text-sm font-semibold text-off-white">{event.title}</td>
              <td className="px-6 py-4 text-sm text-text-grey">
                {event.event_subtype ? EVENT_SUBTYPE_LABEL[event.event_subtype] : '—'}
              </td>
              <td className="px-6 py-4 text-sm text-text-muted">{event.organizer ?? '—'}</td>
              <td className="px-6 py-4">
                <span
                  className={
                    event.is_published
                      ? 'rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success'
                      : 'rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-text-grey'
                  }
                >
                  {event.is_published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(event)}
                    className="rounded-lg p-2 text-text-grey hover:bg-white/10 hover:text-off-white"
                    aria-label="Edit"
                  >
                    <PencilSquareIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event)}
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
        title={editing ? 'Edit Event' : 'Add Event'}
        size="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Title" fullWidth {...register('title')} error={errors.title?.message} />
          <TextArea
            label="Synopsis"
            {...register('synopsis')}
            error={errors.synopsis?.message}
          />
          <Input
            label="Organizer"
            fullWidth
            {...register('organizer')}
            error={errors.organizer?.message}
          />
          <Select
            label="Subtype"
            fullWidth
            {...register('event_subtype')}
            error={errors.event_subtype?.message}
          >
            <option value="">Select subtype</option>
            {SUBTYPES.map(key => (
              <option key={key} value={key}>
                {EVENT_SUBTYPE_LABEL[key]}
              </option>
            ))}
          </Select>
          <Input
            label="Venue label"
            fullWidth
            {...register('venue_label')}
            error={errors.venue_label?.message}
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
            <label className="form-label" htmlFor="event-poster">
              Poster
            </label>
            <input
              id="event-poster"
              type="file"
              accept="image/*"
              onChange={e => setPosterFile(e.target.files?.[0] ?? null)}
              className="form-control"
            />
          </div>

          <CheckBox label="Published" {...register('is_published')} />

          <Button type="submit" loading={submitting} fullWidth className="mt-2">
            {editing ? 'Save Changes' : 'Create Event'}
          </Button>
        </form>
      </PopupModal>
    </div>
  )
}
