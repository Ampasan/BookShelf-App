import axios from 'axios';

const client = axios.create({
  baseURL: 'https://openlibrary.org',
  timeout: 15000,
});

function unwrapData(response) {
  return response?.data;
}

export async function fetchDailyTrending() {
  return client.get('/trending/daily.json').then(unwrapData);
}

export async function fetchSubjectWorks(subject, { limit = 20 } = {}) {
  if (!subject) throw new Error('Missing subject');
  const safeSubject = encodeURIComponent(String(subject).trim());
  return client.get(`/subjects/${safeSubject}.json`, { params: { limit } }).then(unwrapData);
}

function normalizeWorkId(workId) {
  const raw = String(workId ?? '').trim();
  if (!raw) throw new Error('Missing workId');
  return raw.startsWith('OL') ? raw : raw.replace(/^\/?works\//, '');
}

export async function fetchWorkDetail(workId) {
  const id = normalizeWorkId(workId);
  return client.get(`/works/${id}.json`).then(unwrapData);
}

export async function fetchWorkEditions(workId, { limit = 1 } = {}) {
  const id = normalizeWorkId(workId);
  return client.get(`/works/${id}/editions.json`, { params: { limit } }).then(unwrapData);
}

export async function fetchAuthor(authorKey) {
  const key = String(authorKey ?? '').trim();
  const id = key.includes('/') ? key.split('/').filter(Boolean).pop() : key;
  if (!id) throw new Error('Missing author key');
  return client.get(`/authors/${id}.json`).then(unwrapData);
}

