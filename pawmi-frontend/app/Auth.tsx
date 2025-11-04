// Temporary shim to avoid breaking imports while the real implementation lives in lib/auth-context.
export { AuthProvider, useAuth } from '../lib/auth-context';

export default function AuthRoutePlaceholder() {
  return null;
}