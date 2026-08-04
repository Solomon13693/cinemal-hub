import React from 'react'

interface FileLabelProps {
  name: string
  fileTypes?: string[]
  required?: boolean
}

interface InputLabelProps {
  name: string
  required?: boolean
}

export const createFileLabel = ({ name, fileTypes, required = false }: FileLabelProps) => {
  const fileTypesStr = fileTypes?.join(', ') || ''
  return (
    <>
      <span>{name}</span>
      {fileTypesStr && <span className="text-xs text-text-grey">({fileTypesStr}) | max 500kb</span>}
      {required && <span className="text-danger">*</span>}
    </>
  )
}

export const createInputLabel = ({ name, required = false }: InputLabelProps) => (
  <>
    <span>{name}</span>
    {required && <span className="text-danger">*</span>}
  </>
)
