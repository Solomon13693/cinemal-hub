'use client'

import Link from 'next/link'
import { useCustomers } from '@/services'
import { getAdminCustomerDetailHref } from '@/constants'
import { DataTable, type Column } from '@/components/ui'
import type { CustomerType } from '@/types'

const columns: Column[] = [
  { key: 'customer', title: 'Customer' },
  { key: 'phone', title: 'Phone' },
  { key: 'joined', title: 'Joined' },
]

export default function AdminCustomersView() {
  const { customers, loading } = useCustomers()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">Customers</h1>
      <p className="mt-1 text-sm text-text-muted">People who book tickets on CinemaHub.</p>

      <div className="mt-6">
        <DataTable<CustomerType>
          columns={columns}
          data={customers}
          loading={loading}
          rowKey={customer => customer.id}
          emptyMessage="No customers yet."
          renderRow={customer => (
            <>
              <td className="px-6 py-4">
                <Link href={getAdminCustomerDetailHref(customer.id)} className="group block">
                  <p className="text-sm font-semibold text-off-white group-hover:text-primary">
                    {customer.name}
                  </p>
                  {customer.email && (
                    <p className="text-xs text-text-grey">{customer.email}</p>
                  )}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-text-muted">
                {customer.phone ?? '—'}
              </td>
              <td className="px-6 py-4 text-xs text-text-grey">
                {new Date(customer.created_at).toLocaleDateString()}
              </td>
            </>
          )}
        />
      </div>
    </div>
  )
}
