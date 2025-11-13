// 🔧 Node.js 原生 RPC Provider
// 解决 Next.js 中 ethers.js 使用 web 版本的问题

import { ethers } from 'ethers';
import https from 'https';
import http from 'http';

/**
 * 使用 Node.js 原生 http/https 模块创建 RPC Provider
 * 这样可以避免 Next.js 使用 ethers.js 的 web 版本
 */
export function createNodeRpcProvider(rpcUrl: string, network?: ethers.utils.Networkish): ethers.providers.JsonRpcProvider {
  const url = new URL(rpcUrl);
  const isHttps = url.protocol === 'https:';
  
  // 创建自定义的 fetch 函数，使用 Node.js 原生模块
  const customFetch = async (url: string, options: any): Promise<Response> => {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: 30000, // 30 秒超时
      };
      
      const req = client.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          // 创建一个类似 Response 的对象
          const response = {
            ok: res.statusCode && res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode || 500,
            statusText: res.statusMessage || 'Unknown',
            json: async () => JSON.parse(data),
            text: async () => data,
          } as any;
          
          resolve(response as Response);
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  };
  
  // 创建 Provider，但我们需要覆盖其内部的 fetch
  // 注意：ethers.js v5 的 JsonRpcProvider 内部使用 fetch
  // 我们需要通过其他方式来确保使用 Node.js 原生模块
  
  // 方案：直接使用 ethers.js 的 JsonRpcProvider，但确保在 Node.js 环境中运行
  // 如果还是使用 web 版本，我们可以创建一个自定义的 Provider
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, network);
  
  // 尝试覆盖内部的 connection.fetch（如果存在）
  if ((provider as any).connection && (provider as any).connection.fetch) {
    (provider as any).connection.fetch = customFetch;
  }
  
  return provider;
}

/**
 * 直接使用 Node.js 原生模块进行 RPC 调用
 * 这是最可靠的方法，完全绕过 ethers.js 的 fetch
 */
export async function nodeRpcCall(
  rpcUrl: string,
  method: string,
  params: any[] = []
): Promise<any> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(rpcUrl);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 秒超时
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error.message || 'RPC error'));
          } else {
            resolve(json.result);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout after 30s'));
    });
    
    req.write(JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: 1
    }));
    
    req.end();
  });
}

