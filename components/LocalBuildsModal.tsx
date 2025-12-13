'use client'

import { useState, useEffect } from 'react'
import { useBuildStore } from '@/lib/buildStore'
import {
  getLocalBuilds,
  saveLocalBuild,
  deleteLocalBuild,
  duplicateLocalBuild,
  updateLocalBuild,
  markBuildOpened,
  type LocalBuild,
} from '@/lib/localBuildStore'

interface LocalBuildsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LocalBuildsModal({ isOpen, onClose }: LocalBuildsModalProps) {
  const [builds, setBuilds] = useState<LocalBuild[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveName, setSaveName] = useState('')
  const engine = useBuildStore((state) => state.engine)
  const parts = useBuildStore((state) => state.parts)
  const loadBuild = useBuildStore((state) => state.loadBuild)

  useEffect(() => {
    if (isOpen) {
      setBuilds(getLocalBuilds())
    }
  }, [isOpen])

  const handleLoad = (build: LocalBuild) => {
    loadBuild(build.data.engine, build.data.parts)
    markBuildOpened(build.id)
    onClose()
  }

  const handleSave = () => {
    if (!saveName.trim()) return
    if (!engine && parts.length === 0) {
      alert('No build to save. Add an engine or parts first.')
      return
    }
    saveLocalBuild(saveName.trim(), engine, parts)
    setSaveName('')
    setShowSaveForm(false)
    setBuilds(getLocalBuilds())
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this build?')) return
    deleteLocalBuild(id)
    setBuilds(getLocalBuilds())
  }

  const handleDuplicate = (id: string) => {
    duplicateLocalBuild(id)
    setBuilds(getLocalBuilds())
  }

  const handleStartEdit = (build: LocalBuild) => {
    setEditingId(build.id)
    setEditName(build.name)
  }

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return
    updateLocalBuild(id, { name: editName.trim() })
    setEditingId(null)
    setEditName('')
    setBuilds(getLocalBuilds())
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-heading font-bold text-garage-dark">My Builds</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {showSaveForm ? (
            <div className="mb-6 p-4 bg-garage-cream rounded-lg">
              <h3 className="font-semibold mb-2">Save Current Build</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Build name..."
                  className="flex-1 p-2 border border-gray-300 rounded"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave()
                    if (e.key === 'Escape') {
                      setShowSaveForm(false)
                      setSaveName('')
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  className="bg-garage-orange text-white px-4 py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveForm(false)
                    setSaveName('')
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSaveForm(true)}
              className="w-full mb-4 bg-garage-orange text-white py-2 rounded-lg font-heading hover:bg-opacity-90 transition"
            >
              Save Current Build
            </button>
          )}

          {builds.length === 0 ? (
            <div className="text-center py-12 text-garage-gray">
              <p className="mb-4">No saved builds yet.</p>
              <p className="text-sm">Save your current build to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {builds.map((build) => (
                <div
                  key={build.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-garage-cream transition"
                >
                  {editingId === build.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(build.id)
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(build.id)}
                        className="bg-success-green text-white px-3 py-2 rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-garage-dark">{build.name}</h3>
                          <p className="text-sm text-garage-gray">
                            {build.data.engine?.name || 'No engine'} • {build.data.parts.length} parts
                          </p>
                          <p className="text-xs text-garage-gray mt-1">
                            Created {new Date(build.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoad(build)}
                            className="bg-garage-orange text-white px-3 py-1 rounded text-sm hover:bg-opacity-90"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleStartEdit(build)}
                            className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => handleDuplicate(build.id)}
                            className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleDelete(build.id)}
                            className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

