'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  useEvents,
  useVenues,
  useSessions,
  createSession,
  updateSession,
  deleteSession,
} from '@/services'
import { useToast } from '@/hooks'
import { formatCurrency, formatDateTime } from '@/utils'
import {
  Button,
  Input,
  Select,
  PopupModal,
  DataTable,
  type Column,
} from '@/components/ui'
import type { SessionPayloadType, SessionStatusType, SessionType } from '@/types'

type SessionFormValues = {
  event_id: string
  venue_id: string
  starts_at: string
  base_price: number
  vip_price: number
  status: SessionStatusType
}

const STATUS_OPTIONS: SessionStatusType[] = ['scheduled', 'cancelled', 'completed']

const schema: yup.ObjectSchema<SessionFormValues> = yup.object({
  event_id: yup.string().required('Event is required'),
  venue_id: yup.string().required('Venue is required'),
  starts_at: yup.string().required('Start time is required'),
  base_price: yup
    .number()
    .required('Base price is required')
    .min(0, 'Must be 0 or more')
    .typeError('Enter a valid price'),
  vip_price: yup
    .number()
    .required('VIP price is required')
    .min(0, 'Must be 0 or more')
    .typeError('Enter a valid price'),
  status: yup
    .mixed<SessionStatusType>()
    .oneOf(STATUS_OPTIONS)
    .required('Status is required'),
})

function toLocalInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const columns: Column[] = [
  { key: 'event', title: 'Event' },
  { key: 'venue', title: 'Venue' },
  { key: 'starts', title: 'Starts' },
  { key: 'prices', title: 'Prices' },
  { key: 'status', title: 'Status' },
  { key: 'actions', title: '', className: 'text-right' },
]

export default function AdminSessionsView() {
  const { events } = useEvents()
  const { venues } = useVenues()
  const { sessions, loading, refresh } = useSessions()
  const { showSuccess, showError } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<SessionType | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const selectableEvents = events.filter(
    e => e.is_published || e.id === editing?.event_id,
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      event_id: '',
      venue_id: '',
      starts_at: '',
      base_price: 0,
      vip_price: 0,
      status: 'scheduled',
    },
  })

  const openCreateModal = () => {
    setEditing(null)
    reset({
      event_id: '',
      venue_id: '',
      starts_at: '',
      base_price: 0,
      vip_price: 0,
      status: 'scheduled',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (session: SessionType) => {
    setEditing(session)
    reset({
      event_id: session.event_id,
      venue_id: session.venue_id,
      starts_at: toLocalInput(session.starts_at),
      base_price: Number(session.base_price),
      vip_price: Number(session.vip_price),
      status: session.status,
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (values: SessionFormValues) => {
    setSubmitting(true)
    try {
      const payload: SessionPayloadType = {
        event_id: values.event_id,
        venue_id: values.venue_id,
        starts_at: new Date(values.starts_at).toISOString(),
        base_price: Number(values.base_price),
        vip_price: Number(values.vip_price),
        status: values.status,
      }

      if (editing) {
        await updateSession(editing.id, payload)
        showSuccess('Session updated')
      } else {
        await createSession(payload)
        showSuccess('Session created')
      }
      setIsModalOpen(false)
      refresh()
    } catch (error) {
      showError('Save failed', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (session: SessionType) => {
    const title = session.events?.title ?? 'this session'
    if (!window.confirm(`Delete session for "${title}"? This cannot be undone.`)) return
    try {
      await deleteSession(session.id)
      showSuccess('Session deleted')
      refresh()
    } catch (error) {
      showError('Delete failed', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">Sessions</h1>
          <p className="mt-1 text-sm text-text-muted">
            Schedule showtimes for movies and events.
          </p>
        </div>
        <Button onClick={openCreateModal} startContent={<PlusIcon className="size-4" />}>
          Add Session
        </Button>
      </div>

      <div className="mt-6">
        <DataTable<SessionType>
          columns={columns}
          data={sessions}
          loading={loading}
          rowKey={s => s.id}
          emptyMessage="No sessions yet."
          renderRow={session => (
            <>
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-off-white">
                  {session.events?.title ?? '—'}
                </p>
                <p className="text-xs capitalize text-text-grey">
                  {session.events?.kind ?? '—'}
                </p>
              </td>
              <td className="px-6 py-4 text-sm text-text-muted">
                {session.venues?.name ?? '—'}
              </td>
              <td className="px-6 py-4 text-sm text-text-muted">
                {formatDateTime(session.starts_at)}
              </td>
              <td className="px-6 py-4 text-sm text-text-grey">
                {formatCurrency(Number(session.base_price))} /{' '}
                {formatCurrency(Number(session.vip_price))} VIP
              </td>
              <td className="px-6 py-4">
                <span
                  className={
                    session.status === 'scheduled'
                      ? 'rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold capitalize text-success'
                      : session.status === 'cancelled'
                        ? 'rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold capitalize text-danger'
                        : 'rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold capitalize text-text-grey'
                  }
                >
                  {session.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(session)}
                    className="rounded-lg p-2 text-text-grey hover:bg-white/10 hover:text-off-white"
                    aria-label="Edit"
                  >
                    <PencilSquareIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(session)}
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
        title={editing ? 'Edit Session' : 'Add Session'}
        size="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Select
            label="Event"
            fullWidth
            {...register('event_id')}
            error={errors.event_id?.message}
          >
            <option value="">Select an event</option>
            {selectableEvents.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} ({event.kind === 'movie' ? 'Movie' : 'Event'})
              </option>
            ))}
          </Select>

          <Select
            label="Venue"
            fullWidth
            {...register('venue_id')}
            error={errors.venue_id?.message}
          >
            <option value="">Select a venue</option>
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </Select>

          <Input
            label="Starts at"
            type="datetime-local"
            fullWidth
            {...register('starts_at')}
            error={errors.starts_at?.message}
          />

          <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
            <Input
              label="Base price"
              type="number"
              fullWidth
              {...register('base_price')}
              error={errors.base_price?.message}
            />
            <Input
              label="VIP price"
              type="number"
              fullWidth
              {...register('vip_price')}
              error={errors.vip_price?.message}
            />
          </div>

          <Select
            label="Status"
            fullWidth
            {...register('status')}
            error={errors.status?.message}
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </Select>

          <Button type="submit" loading={submitting} fullWidth className="mt-2">
            {editing ? 'Save Changes' : 'Create Session'}
          </Button>
        </form>
      </PopupModal>
    </div>
  )
}
