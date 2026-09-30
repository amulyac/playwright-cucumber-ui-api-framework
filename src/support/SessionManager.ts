import fs from 'fs';
import path from 'path';
import { request } from '@playwright/test';
import { config } from './config';
import { getTestUser } from '../utils/testUsers';

/**
 * STORAGE STATE = a JSON file with cookies + localStorage of a logged-in browser.
 * Log in ONCE, save the file, then start any number of browser contexts already
 * logged in -> scenarios skip the login screen (faster, less flaky).
 *
 * Files are written to .auth/ (git-ignored - they contain live session tokens).
 */
export class SessionManager {
  static readonly authDir = path.resolve(__dirname, '../../.auth');
  private static readonly createdThisRun = new Set<string>();

  static filePath(fileName: string): string {
    return path.join(SessionManager.authDir, fileName);
  }

  /**
   * Returns the storage-state file for a test user, creating it on first use.
   * Login is done through the API (fast) - no browser needed to create it.
   * Created once per run, because the demo app forgets sessions when it restarts.
   */
  static async storageStateFor(userKey: string): Promise<string> {
    const file = SessionManager.filePath(`${userKey}.json`);
    if (SessionManager.createdThisRun.has(userKey)) return file;

    const user = getTestUser(userKey);
    const api = await request.newContext({ baseURL: config.apiBaseUrl });
    try {
      const response = await api.post('/api/auth/login', {
        data: { email: user.email, password: user.password },
      });
      if (response.status() !== 200) {
        throw new Error(`Could not create a session for "${userKey}": ${response.status()} ${await response.text()}`);
      }
      fs.mkdirSync(SessionManager.authDir, { recursive: true });
      await api.storageState({ path: file }); // saves the session cookie the login set
    } finally {
      await api.dispose();
    }
    SessionManager.createdThisRun.add(userKey);
    return file;
  }
}
