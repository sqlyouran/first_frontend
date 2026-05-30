import "server-only";

/**
 * Thin BFF helper: fetch from Spring Boot backend in Server Components only.
 *
 * 边界（参考父仓 AGENTS.md「技术选型约束」）：
 *   允许：SSR 数据预取 / 多接口聚合 / 字段裁剪 / 缓存读
 *   禁止：写入 / 鉴权写 / 事务 / 领域逻辑
 *
 * @param path - 后端 API 路径，以 `/` 开头（如 `/api/hello`）
 * @param init - 可选 fetch 配置；默认 cache: 'no-store'（薄 BFF：不缓存）
 */
export async function fetchFromBackend(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL environment variable is not set");
  }

  const url = `${backendUrl}${path}`;
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
  });

  return response;
}
