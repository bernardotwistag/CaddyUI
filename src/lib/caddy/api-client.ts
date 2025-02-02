import { CaddyConfig, UpstreamStatus, CaddyCAInfo } from './types';

export class CaddyApiClient {
  constructor() {
    console.log('🔧 CaddyApiClient initialized');
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `/api/caddy-proxy${path}`;
    console.log('🔗 Making request to:', url);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Caddy API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('❌ Request failed:', error);
      throw error;
    }
  }

  // Configuration Management
  async getConfig(): Promise<CaddyConfig> {
    console.log('📤 Requesting Caddy config');
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

  // Load Complete Configuration
  async loadConfig(config: CaddyConfig): Promise<void> {
    await this.request('/load', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

    // Adapt Config Complete Configuration
    async adaptConfig(config: CaddyConfig): Promise<void> {
      await this.request('/adapt', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    }
  

  // Stop Server
  async stop(): Promise<void> {
    await this.request('/stop', {
      method: 'POST',
    });
  }

  // Get Upstream Status
  async getUpstreamStatus(): Promise<UpstreamStatus[]> {
    return this.request<UpstreamStatus[]>('/reverse_proxy/upstreams');
  }

  // Get CA Information
  async getCAInfo(id: string): Promise<CaddyCAInfo> {
    return this.request<CaddyCAInfo>(`/pki/ca/${id}`);
  }

  // Get CA Certificates
  async getCACertificates(id: string): Promise<string> {
    return this.request<string>(`/pki/ca/${id}/certificates`);
  }
} 