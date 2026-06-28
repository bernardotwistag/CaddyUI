import { CaddyConfig, UpstreamStatus, CaddyCAInfo } from './types';

export class CaddyApiClient {
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `/api/caddy-proxy${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const details = errorBody.details || errorBody.error || response.statusText;
      throw new Error(`Caddy API error (${response.status}): ${details}`);
    }

    return await response.json() as T;
  }

  async getConfig(): Promise<CaddyConfig> {
    return this.request('/config');
  }

  async setConfig(path: string, config: Partial<CaddyConfig>): Promise<void> {
    await this.request(`/config/${path}`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async updateConfig(path: string, config: Partial<CaddyConfig>): Promise<void> {
    await this.request(`/config/${path}`, {
      method: 'PATCH',
      body: JSON.stringify(config),
    });
  }

  async deleteConfig(path: string): Promise<void> {
    await this.request(`/config/${path}`, {
      method: 'DELETE',
    });
  }

  async loadConfig(config: CaddyConfig): Promise<void> {
    await this.request('/load', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async adaptConfig(config: CaddyConfig): Promise<void> {
    await this.request('/adapt', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async stop(): Promise<void> {
    await this.request('/stop', {
      method: 'POST',
    });
  }

  async getUpstreamStatus(): Promise<UpstreamStatus[]> {
    return this.request<UpstreamStatus[]>('/reverse_proxy/upstreams');
  }

  async getCAInfo(id: string): Promise<CaddyCAInfo> {
    return this.request<CaddyCAInfo>(`/pki/ca/${id}`);
  }

  async getCACertificates(id: string): Promise<string> {
    return this.request<string>(`/pki/ca/${id}/certificates`);
  }
}
