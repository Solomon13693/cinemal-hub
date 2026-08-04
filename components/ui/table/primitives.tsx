import React from 'react'
import { cn } from '@/lib'

export const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className="w-full min-w-0 overflow-x-auto">
        <table className={cn('w-full table-fixed', className)}>{children}</table>
    </div>
)

export const TableHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <thead
        className={cn('text-xs font-bold uppercase tracking-widest text-text-grey', className)}
        style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
        {children}
    </thead>
)

export const TableHead = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <th className={cn('px-6 py-3 text-left whitespace-nowrap font-bold', className)}>{children}</th>
)

export const TableBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <tbody className={cn('divide-y divide-white/4', className)}>{children}</tbody>
)

export const TableRow = ({
    children,
    className,
    onClick,
    style,
}: {
    children: React.ReactNode
    className?: string
    onClick?: () => void
    style?: React.CSSProperties
}) => (
    <tr
        className={cn('transition-colors', onClick && 'cursor-pointer hover:bg-white/2', className)}
        onClick={onClick}
        style={style}
    >
        {children}
    </tr>
)

export const TableCell = ({
    children,
    className,
    colSpan,
}: {
    children?: React.ReactNode
    className?: string
    colSpan?: number
}) => (
    <td colSpan={colSpan} className={cn('px-6 py-4 text-sm text-off-white', className)}>
        {children}
    </td>
)
