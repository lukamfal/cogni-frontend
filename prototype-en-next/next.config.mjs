import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This app lives inside the cogni-frontend repo; keep Turbopack from using the parent folder as root
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
}

export default nextConfig
