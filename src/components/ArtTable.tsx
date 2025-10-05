import { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Checkbox } from 'primereact/checkbox'
import { fetchArtworks } from '../api'
import type { Artwork } from '../api'

const LOCAL_KEY = 'selected_artworks'

type SelectedInfo = {
  id: number
  title: string
  artist_display?: string | null
}

export default function ArtTable() {
  const [rows, setRows] = useState<Artwork[]>([])
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedMap, setSelectedMap] = useState<Record<number, SelectedInfo>>({})

  // Load saved selections
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) setSelectedMap(JSON.parse(raw))
  }, [])

  // Save selections
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(selectedMap))
  }, [selectedMap])

  // Fetch data for the current page
  useEffect(() => {
    setLoading(true)
    fetchArtworks(page).then((res) => {
      setRows(res.data)
      setTotalRecords(res.pagination.total)
      setLoading(false)
    })
  }, [page])

  // Toggle single row selection
  const toggleSelectRow = (row: Artwork, checked: boolean) => {
    const newMap = { ...selectedMap }
    if (checked) newMap[row.id] = { id: row.id, title: row.title, artist_display: row.artist_display }
    else delete newMap[row.id]
    setSelectedMap(newMap)
  }

  // Toggle select/deselect all on current page
  const toggleSelectAllPage = (checked: boolean) => {
    const newMap = { ...selectedMap }
    if (checked) {
      for (const r of rows) newMap[r.id] = { id: r.id, title: r.title, artist_display: r.artist_display }
    } else {
      for (const r of rows) delete newMap[r.id]
    }
    setSelectedMap(newMap)
  }

  // Header checkbox
  const headerCheckbox = () => {
    const allOnPage = rows.length > 0 && rows.every((r) => selectedMap[r.id])
    const someOnPage = rows.some((r) => selectedMap[r.id])
    return (
      <Checkbox
        checked={allOnPage}
        onChange={(e) => toggleSelectAllPage(!!e.checked)}
        className={someOnPage && !allOnPage ? 'p-checkbox-tristate' : ''}
      />
    )
  }

  return (
    <div>
      <DataTable
        value={rows}
        paginator
        rows={10}
        totalRecords={totalRecords}
        lazy
        onPage={(e) => {
          setPage(e.page! + 1) // PrimeReact pagination starts at 0
        }}
        loading={loading}
        responsiveLayout="stack"
      >
        <Column
          header={headerCheckbox()}
          body={(row) => (
            <Checkbox
              checked={!!selectedMap[row.id]}
              onChange={(e) => toggleSelectRow(row, !!e.checked)}
            />
          )}
          style={{ width: '3rem' }}
        />
        <Column field="title" header="Title" />
        <Column field="artist_display" header="Artist" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Year" />
        <Column field="date_end" header="End Year" />
      </DataTable>
    </div>
  )
}
