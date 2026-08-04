'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useVenues, createVenue, updateVenue, deleteVenue } from '@/services'
import { useToast } from '@/hooks'
import { Button, Input, PopupModal, DataTable, type Column } from '@/components/ui'
import type { VenuePayloadType, VenueType } from '@/types'

type VenueFormValues = {
  name: string
  rows: number
  seats_per_row: number
}

const schema: yup.ObjectSchema<VenueFormValues> = yup.object({
  name: yup.string().required('Name is required'),
  rows: yup
    .number()
    .required('Rows is required')
    .min(1, 'Minimum 1 row')
    .max(26, 'Maximum 26 rows')
    .typeError('Enter a valid number'),
  seats_per_row: yup
    .number()
    .required('Seats per row is required')
    .min(1, 'Minimum 1 seat')
    .max(40, 'Maximum 40 seats per row')
    .typeError('Enter a valid number'),
})

const columns: Column[] = [
  { key: 'name', title: 'Venue' },
  { key: 'rows', title: 'Rows' },
  { key: 'seats', title: 'Seats / row' },
  { key: 'capacity', title: 'Capacity' },
  { key: 'actions', title: '', className: 'text-right' },
]

export default function AdminVenuesView() {
  const { venues, loading, refresh } = useVenues()
  const { showSuccess, showError } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<VenueType | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VenueFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', rows: 10, seats_per_row: 12 },
  })

  const openCreateModal = () => {
    setEditing(null)
    reset({ name: '', rows: 10, seats_per_row: 12 })
    setIsModalOpen(true)
  }

  const openEditModal = (venue: VenueType) => {
    setEditing(venue)
    reset({
      name: venue.name,
      rows: venue.rows,
      seats_per_row: venue.seats_per_row,
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (values: VenueFormValues) => {
    setSubmitting(true)
    try {
      const payload: VenuePayloadType = {
        name: values.name,
        rows: Number(values.rows),
        seats_per_row: Number(values.seats_per_row),
      }

      if (editing) {
        await updateVenue(editing.id, payload)
        showSuccess('Venue updated')
      } else {
        await createVenue(payload)
        showSuccess('Venue created')
      }
      setIsModalOpen(false)
      refresh()
    } catch (error) {
      showError('Save failed', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (venue: VenueType) => {
    if (!window.confirm(`Delete "${venue.name}"? This cannot be undone.`)) return
    try {
      await deleteVenue(venue.id)
      showSuccess('Venue deleted')
      refresh()
    } catch (error) {
      showError('Delete failed', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">Venues</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage auditoriums. Saving regenerates the seat map.
          </p>
        </div>
        <Button onClick={openCreateModal} startContent={<PlusIcon className="size-4" />}>
          Add Venue
        </Button>
      </div>

      <div className="mt-6">
        <DataTable<VenueType>
          columns={columns}
          data={venues}
          loading={loading}
          rowKey={v => v.id}
          emptyMessage="No venues yet."
          renderRow={venue => (
            <>
              <td className="px-6 py-4 text-sm font-semibold text-off-white">{venue.name}</td>
              <td className="px-6 py-4 text-sm text-text-muted">{venue.rows}</td>
              <td className="px-6 py-4 text-sm text-text-muted">{venue.seats_per_row}</td>
              <td className="px-6 py-4 text-sm text-text-grey">
                {venue.rows * venue.seats_per_row}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(venue)}
                    className="rounded-lg p-2 text-text-grey hover:bg-white/10 hover:text-off-white"
                    aria-label="Edit"
                  >
                    <PencilSquareIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(venue)}
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
        title={editing ? 'Edit Venue' : 'Add Venue'}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" fullWidth {...register('name')} error={errors.name?.message} />
          <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
            <Input
              label="Rows (1–26)"
              type="number"
              fullWidth
              {...register('rows')}
              error={errors.rows?.message}
            />
            <Input
              label="Seats per row (1–40)"
              type="number"
              fullWidth
              {...register('seats_per_row')}
              error={errors.seats_per_row?.message}
            />
          </div>
          {editing && (
            <p className="mb-3 text-xs text-warning">
              Changing rows or seats per row will delete and regenerate all seats for this venue.
            </p>
          )}
          <Button type="submit" loading={submitting} fullWidth className="mt-2">
            {editing ? 'Save Changes' : 'Create Venue'}
          </Button>
        </form>
      </PopupModal>
    </div>
  )
}
