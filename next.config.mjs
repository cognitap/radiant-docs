import { createMDX } from 'fumadocs-mdx/next'
import { radiantPackage } from './scripts/radiant-package.mjs'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  trailingSlash: true,
  agentRules: false,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_RADIANT_VERSION: radiantPackage.version,
    NEXT_PUBLIC_RADIANT_CANDIDATE: radiantPackage.candidate
  }
}

export default withMDX(config)
