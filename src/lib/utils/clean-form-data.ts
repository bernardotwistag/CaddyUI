import { ServerFormData } from "@/app/(dashboard)/http/components/server-form"
import { ReverseProxyFormData } from "@/app/(dashboard)/http/components/reverse-proxy/reverse-proxy-form"

type HeaderArray = Array<{ header: string, values: string[] }>;
type HeaderRecord = Record<string, string[]>;

function transformHeaderArray(headerArray: HeaderArray): HeaderRecord {
  return headerArray.reduce((acc, { header, values }) => {
    acc[header] = values;
    return acc;
  }, {} as HeaderRecord);
}

function transformHeaderRecord(headerRecord: HeaderRecord | HeaderArray): Record<string, string[]> {
  if (Array.isArray(headerRecord)) {
    return headerRecord.reduce((acc, item) => {
      if ('header' in item) {
        acc[item.header] = item.values;
      }
      return acc;
    }, {} as Record<string, string[]>);
  }

  return headerRecord;
}

export function cleanHeadersConfig(data: ReverseProxyFormData) {
  const headers = { ...data.headers }
  
  // Clean request headers
  if (headers.request) {
    // Transform arrays to record objects
    if (headers.request.add?.length && Array.isArray(headers.request.add)) {
      headers.request.add = transformHeaderArray(headers.request.add);
    } else {
      delete headers.request.add
    }
    
    if (headers.request.set?.length && Array.isArray(headers.request.set)) {
      headers.request.set = transformHeaderArray(headers.request.set);
    } else {
      delete headers.request.set
    }
    
    if (headers.request.delete?.length === 0) {
      delete headers.request.delete
    }
    
    if (Array.isArray(headers.request?.replace) && headers.request.replace.length === 0) {
      delete headers.request.replace
    }
    
    if (Object.keys(headers.request).length === 0) {
      delete headers.request
    }
  }

  // Clean response headers
  if (headers.response) {
    if (headers.response.add?.length && Array.isArray(headers.response.add)) {
      headers.response.add = transformHeaderArray(headers.response.add);
    } else {
      delete headers.response.add
    }
    if (headers.response.set?.length && Array.isArray(headers.response.set)) {
      headers.response.set = transformHeaderArray(headers.response.set);
    } else {
      delete headers.response.set
    }
    
    if (headers.response.delete?.length === 0) {
      delete headers.response.delete
    }
    
    if (Array.isArray(headers.response?.replace) && headers.response.replace.length === 0) {
      delete headers.response.replace
    }
    
    if (!headers.response.deferred) {
      delete headers.response.deferred
    }
    
    if (Object.keys(headers.response).length === 0) {
      delete headers.response
    }
  }

  return {
    ...data,
    headers: Object.keys(headers).length > 0 ? headers : undefined
  }
}

export function prepareHeadersConfig(data: ServerFormData) {
  if (!data.reverseProxyConfig?.headers) return data

  const headers = { ...data.reverseProxyConfig.headers }
  
  if (headers.request) {
    if (headers.request.add && !Array.isArray(headers.request.add)) {
      headers.request.add = transformHeaderRecord(headers.request.add);
    }
    if (headers.request.set) {
      headers.request.set = transformHeaderRecord(headers.request.set as HeaderRecord);
    }

  }

  if (headers.response) {
    if (headers.response.add) {
      headers.response.add = transformHeaderRecord(headers.response.add as HeaderRecord);
    }
    if (headers.response.set) {
      headers.response.set = transformHeaderRecord(headers.response.set as HeaderRecord);
    }
  }

  return {
    ...data,
    reverseProxyConfig: {
      ...data.reverseProxyConfig,
      headers
    }
  }
} 