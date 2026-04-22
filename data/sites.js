let sites = {};

export function saveSite(id, data) {
  sites[id] = data;
}

export function getSite(id) {
  return sites[id];
}