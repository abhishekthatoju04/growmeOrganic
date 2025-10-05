import axios from 'axios'

export interface Artwork {
  id: number
  title: string
  place_of_origin: string | null
  artist_display: string | null
  inscriptions: string | null
  date_start: number | null
  date_end: number | null
}

export async function fetchArtworks(page: number) {
  const url = `https://api.artic.edu/api/v1/artworks?page=${page}`
  const resp = await axios.get(url)
  return {
    data: resp.data.data as Artwork[],
    pagination: resp.data.pagination,
  }
}
