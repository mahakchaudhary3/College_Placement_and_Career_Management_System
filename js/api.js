(() => {
  const BASE = "http://127.0.0.1:3002";
  async function request(resource, options = {}) {
    const response = await fetch(`${BASE}/${resource}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || `JSON Server error: ${response.status}`);
    return data;
  }
  window.PortalDB = {
    get: resource => request(resource),
    post: (resource, body) => request(resource, { method: "POST", body: JSON.stringify(body) }),
    patch: (resource, id, body) => request(`${resource}/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (resource, id) => request(`${resource}/${id}`, { method: "DELETE" })
  };
})();