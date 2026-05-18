import axios, { type AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'

export function makeTestClient(): { client: AxiosInstance; mock: MockAdapter } {
  const client = axios.create({ baseURL: 'http://test.local/api/' })
  const mock = new MockAdapter(client)
  return { client, mock }
}
