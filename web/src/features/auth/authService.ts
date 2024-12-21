export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function removeToken() {
  localStorage.removeItem('token');
}

export async function validateToken(token: string) {
  if (token === 'validToken123') {
    return { id: 1, name: 'John Doe', role: 'user' };
  }
  return null;
}

export async function loginToServer(username: string, password: string) {
  // In a real app, call your backend. Here we simulate success.
  if (username === 'john' && password === 'secret') {
    return { token: 'validToken123', user: { id: 1, name: 'John Doe', role: 'user' } };
  }
  throw new Error('Invalid credentials');
}
