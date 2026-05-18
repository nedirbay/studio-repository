import type { AxiosInstance } from 'axios'

export type HttpClient = AxiosInstance

let _client: HttpClient | null = null
let _factory: (() => HttpClient) | null = null

/**
 * App startup (`main.ts`) registers a factory that builds the shared axios
 * instance. Repositories use it lazily; tests bypass the factory entirely
 * by injecting their own AxiosInstance through the constructor.
 */
export function setHttpClientFactory(factory: () => HttpClient) {
  _factory = factory
  _client = null
}

export function defaultHttpClient(): HttpClient {
  if (!_client) {
    if (!_factory) {
      throw new Error(
        'Default HttpClient is not configured. ' +
        'Call setHttpClientFactory(...) at app startup, or inject a client in the constructor.'
      )
    }
    _client = _factory()
  }
  return _client
}

export abstract class BaseRepository {
  protected client: HttpClient

  constructor(client?: HttpClient) {
    this.client = client ?? defaultHttpClient()
  }
}
